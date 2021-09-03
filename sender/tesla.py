import traceback
import time
import json
import random
import logging
import threading

import click
import requests
import teslapy

LOG_FORMAT = '%(asctime)s %(levelname)s %(module)s(%(lineno)d) - %(message)s'
DATE_FORMAT = '%m/%d %H:%M:%S'
logging.basicConfig(format=LOG_FORMAT, datefmt=DATE_FORMAT, level=logging.INFO)
logger = logging.getLogger('omw_tesla_sender')
logger.setLevel(logging.DEBUG)

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

def send_data(session, interval, duration, host, vehicle):
    session_left = duration - (int(time.time()) - start_time)
    logger.info(f'sending location data... Session time left: {session_left}s')
    if session_left < 0:
        exit(0)

    try:
        drive_state = vehicle.get_vehicle_data()['drive_state']
        now = int(time.time())

        payload = {
            'next_refresh': now + interval,
            'vehicle': drive_state,
            'timestamp': now
        }

        requests.post(f'{host}/location?session={session}', json=payload)
    except Exception as err:
        logger.error('failed to send location data')
        print(traceback.format_exc())
        return


@click.command()
@click.option('--email', '-e', help='the email address of your Tesla account', envvar='TESLA_EMAIL')
@click.option('--password', '-p', help='the password of your Tesla account', envvar='TESLA_PASSWORD')
@click.option('--session', '-s', help='name of the session', required=True)
@click.option('--interval', '-i', help='sending interval in seconds', default=10)
@click.option('--duration', '-d', help='total session duration in minutes', default=60 * 60 * 24)
@click.option('--host', '-h', default='http://localhost:5000')
@click.option('--debug', is_flag=True, default=False)
def tesla(email, password, session, interval, duration, host, debug):
    logger.info(f'sending location to {host} with interval {interval}s. Session duration {int(duration / 60)} minutes')

    if debug:
        logger.info('debug mode on, loading from fixture')
        vehicle = MockTesla()
    else:
        logger.info('connecting to Tesla server...')
        with teslapy.Tesla(email, password) as tesla:
            tesla.fetch_token()
            vehicles = tesla.vehicle_list()
            if len(vehicles) != 1:
                logger.error(f'unexpected number of vehicle found ({len(vehicles)})')
                exit(1)

            vehicle = vehicles[0]

    e = threading.Event()
    while not e.wait(interval):
        send_data(session, interval, duration, host, vehicle)

if __name__ == '__main__':
    tesla()
