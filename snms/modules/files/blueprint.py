# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from __future__ import unicode_literals

from flask import Blueprint
from flask_restful import Api

from snms.modules.files.controllers import FileResource

_bp = Blueprint('files', __name__)
_api = Api(_bp)

_api.add_resource(FileResource, '/sensors/<sensor_id>/files/<uid>')