import os
import traceback
import time
import sys
import json
import random
import logging
import threading

import requests
import teslapy

LOG_FORMAT = '%(asctime)s %(levelname)s %(module)s(%(lineno)d) - %(message)s'
DATE_FORMAT = '%m/%d %H:%M:%S'
logging.basicConfig(format=LOG_FORMAT, datefmt=DATE_FORMAT, level=logging.INFO)
logger = logging.getLogger('omw_tesla_sender')
logger.setLevel(logging.DEBUG)

SEND_INTERVAL = 10
DURATION = 60 * 60 * 24
HOST = 'http://localhost:5000'
vehicle = None
session = ''
start_time = int(time.time())

class MockTesla:

    def __init__(self):
        with open('tests/fixtures/tesla.json') as f:
            self._data = json.load(f)
            logger.info('cache data loaded')

    def get_vehicle_data(self):
        self._data['drive_state']['latitude'] += random.random() / 100
        self._data['drive_state']['longitude'] += random.random() / 100
        logger.debug('getting vehicle data')
        return self._data

def setInterval(func, time):
    e = threading.Event()
    while not e.wait(time):
        func()

def send_data():
    session_left = DURATION - (int(time.time()) - start_time)
    logger.info(f'sending location data... Session time left: {session_left}s')
    if session_left < 0:
        exit(0)

    try:
        drive_state = vehicle.get_vehicle_data()['drive_state']

        payload = {
            'next_refresh': int(time.time()) + SEND_INTERVAL,
            'vehicle': drive_state
        }

        requests.post(f'{HOST}/location?session={session}', json=payload)
    except Exception as err:
        logger.error('failed to send location data')
        print(traceback.format_exc())
        return

if __name__ == '__main__':
    session = sys.argv[1]

    logger.info(f'sending location to {HOST} with interval {SEND_INTERVAL}s. Session duration {int(DURATION / 60)} minutes')

    if os.getenv('TESLA_DEBUG'):
        logger.info('debug mode on, loading from fixture')
        vehicle = MockTesla()
    else:
        logger.info('connecting to Tesla server...')
        with teslapy.Tesla(os.getenv('TESLA_EMAIL'), os.getenv('TESLA_PASSWORD')) as tesla:
            tesla.fetch_token()
            vehicles = tesla.vehicle_list()
            if len(vehicles) != 1:
                logger.error(f'unexpected number of vehicle found ({len(vehicles)})')
                exit(1)

            vehicle = vehicles[0]


    setInterval(send_data, SEND_INTERVAL)