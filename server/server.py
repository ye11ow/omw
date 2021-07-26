import time
import logging
import random
import json
import os
import teslapy

from flask import Flask

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
    app = Flask(__name__)

    return app

app = create_app()
cm = CacheManager()


@app.route("/tesla")
def tesla():
    return cm.get()


