# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

import sys
import os
# TODO: Add snms path to sys
# sys.path.append(os.path.dirname(__file__))
from flask import send_from_directory, jsonify
from flask_cors import CORS

from snms.web.app import make_app
from snms import __version__

app = make_app(set_path=True)

CORS(app, resources=r'/*', allow_headers='*')


@app.route('/swagger.json')
def send_swagger():
    return send_from_directory("", 'swagger.json')


@app.route('/')
def index():
    return jsonify({
        "version": __version__
    })


def main():
    app.run(host="0.0.0.0")

if __name__ == '__main__':
    main()
