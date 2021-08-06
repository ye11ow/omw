import time
import logging
import random
import json
import os
import teslapy
import urllib.parse
import requests

from flask import Flask, send_from_directory, request

API_BASE = 'https://api.mapbox.com/'
API_ADDRESS = f'{API_BASE}geocoding/v5/mapbox.places/'
API_DIRECTION = f'{API_BASE}directions/v5/mapbox/driving/'

MAPBOX_TOKEN = os.getenv('MAPBOX_TOKEN')

class CacheManager:

    def __init__(self):
        self._interval = 60
        self._last_refreshed = None

    def get(self):
        if self.expire():
            print("cache expired, refreshing")
            self._load()
        else:
            print("load cached data")

        return {
            "next_refresh": self._last_refreshed + self._interval,
            "vehicle": self._data['drive_state']
        }

    def expire(self):
        if self._last_refreshed is None:
            return True

        if self._last_refreshed + self._interval < int(time.time()):
            return True

        return False

    def _load(self):
        if os.getenv('TESLA_DEBUG'):
            print('debug mode on, loading from fixture')
            with open('tests/fixtures/response.json') as f:
                self._data = json.load(f)
                self._data['drive_state']['latitude'] += random.random() / 100
                self._data['drive_state']['longitude'] += random.random() / 100
                print('cache data loaded')
        else:
            print('debug mode off, loading from API')
            with teslapy.Tesla(os.getenv('TESLA_EMAIL'), os.getenv('TESLA_PASSWORD')) as tesla:
                tesla.fetch_token()
                vehicles = tesla.vehicle_list()
                if len(vehicles) == 0:
                    print('no vehicle found')
                    exit(1)

                v = vehicles[0]
                v.sync_wake_up()

                self._data = v.get_vehicle_data()

        self._last_refreshed = int(time.time())

def create_app():
    app = Flask(__name__, static_folder = '../build')

    return app

app = create_app()
cm = CacheManager()

@app.route('/<path:path>')
def send_js(path):
    return send_from_directory('../build', path)

@app.route("/tesla")
def tesla():
    return cm.get()

@app.route('/address')
def address():
    addr = request.args.get('address', '')

    print('querying', addr)

    params = {
        'access_token': MAPBOX_TOKEN,
        'autocomplete': 'true',
        'country': 'ca'
    }

    r = requests.get(f'{API_ADDRESS}{urllib.parse.quote(addr)}.json', params = params)

    return r.json()

@app.route('/route')
def route():
    coordinates = request.args.get('coordinates', '')

    print('querying route for ', coordinates)

    params = {
        'access_token': MAPBOX_TOKEN,
        'geometries': 'geojson',
        'steps': 'true'
    }

    r = requests.get(f'{API_DIRECTION}{urllib.parse.quote(coordinates)}', params = params)

    return r.json()



