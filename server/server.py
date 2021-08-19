import time
import logging
import random
import json
import os
import teslapy
import urllib.parse
import requests

from flask import Flask, send_from_directory, request

LOG_FORMAT = '%(asctime)s %(levelname)s %(module)s(%(lineno)d) - %(message)s'
DATE_FORMAT = '%m/%d %H:%M:%S'
logging.basicConfig(format=LOG_FORMAT, datefmt=DATE_FORMAT, level=logging.INFO)
logger = logging.getLogger('omw')
logger.setLevel(logging.DEBUG)

API_BASE = 'https://api.mapbox.com/'
API_ADDRESS = f'{API_BASE}geocoding/v5/mapbox.places/'
API_DIRECTION = f'{API_BASE}directions/v5/mapbox/driving/'

MAPBOX_TOKEN = os.getenv('MAPBOX_TOKEN')

class CacheManager:

    def __init__(self):
        self.interval = 60
        self._last_refreshed = None
        self._addr = {}
        self._vehicle = None
        self._data = {}

    def get_tesla(self):
        if self.expire():
            logger.debug("tesla cache expired, refreshing")
            self._get_telsa()

        logger.info("querying tesla data")

        return {
            "next_refresh": self._last_refreshed + self.interval,
            "vehicle": self._data['drive_state']
        }

    def expire(self):
        if self._last_refreshed is None:
            return True

        if self._last_refreshed + self.interval < int(time.time()):
            return True

        return False

    def get_addr(self, addr):
        if not addr in self._addr:
            logger.debug('address is not cached, loading from Mapbox')
            params = {
                'access_token': MAPBOX_TOKEN,
                'autocomplete': 'true',
                'country': 'ca'
            }

            r = requests.get(f'{API_ADDRESS}{urllib.parse.quote(addr)}.json', params = params)
            self._addr[addr] = r.json()

            return self._addr[addr]

        logger.info(f'querying address {addr}')

        return self._addr[addr]

    def _get_telsa(self):
        if os.getenv('TESLA_DEBUG'):
            logger.info('debug mode on, loading from fixture')
            with open('tests/fixtures/response.json') as f:
                self._data = json.load(f)
                self._data['drive_state']['latitude'] += random.random() / 100
                self._data['drive_state']['longitude'] += random.random() / 100
                logger.info('cache data loaded')
        else:
            if not self._vehicle:
                with teslapy.Tesla(os.getenv('TESLA_EMAIL'), os.getenv('TESLA_PASSWORD')) as tesla:
                    tesla.fetch_token()
                    vehicles = tesla.vehicle_list()
                    if len(vehicles) != 1:
                        logger.error(f'unexpected number of vehicle found ({len(vehicles)})')
                        exit(1)

                    self._vehicle = vehicles[0]

            # self._vehicle.sync_wake_up()
            self._data = self._vehicle.get_vehicle_data()

        self._last_refreshed = int(time.time())

    def set(self, sess, location):
        self._data[sess] = location

    def get(self, sess):
        if sess in self._data:
            return self._data[sess]
        return {}

    @property
    def interval(self):
        return self._interval

    @interval.setter
    def interval(self, val):
        self._interval = val

def create_app():
    app = Flask(__name__, static_folder = '../build')

    return app

app = create_app()
cm = CacheManager()

@app.route('/<path:path>')
def send_js(path):
    return send_from_directory('../build', path)

@app.route("/location", methods=['GET', 'POST'])
def location():
    sess = request.args.get('session', '')
    if not sess:
        return {}

    if request.method == 'POST':
        data = request.get_json()
        cm.set(sess, data)
        return {}
    else:
        if sess == 'tesla':
            return cm.get_tesla()
        else:
            return cm.get(sess)

@app.route('/address')
def address():
    addr = request.args.get('address', '')

    return cm.get_addr(addr)

@app.route('/route')
def route():
    coordinates = request.args.get('coordinates', '')

    logger.info(f'querying route for {coordinates}')

    params = {
        'access_token': MAPBOX_TOKEN,
        'geometries': 'geojson',
        'steps': 'false'
    }

    r = requests.get(f'{API_DIRECTION}{urllib.parse.quote(coordinates)}', params = params)

    return r.json()

@app.route('/debug/pause')
def pause():
    before = cm.interval
    cm.interval = 60*60*24*365
    return {
        'before': before,
        'after': 60*60*24*365
    }

@app.route('/debug/resume')
def resume():
    before = cm.interval
    cm.interval = 60
    return {
        'before': before,
        'after': 60
    }
