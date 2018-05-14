# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from __future__ import unicode_literals

from flask import Blueprint
from flask_restful import Api
from snms.modules.ota.controllers import FirmwareListResource, FirmwareResource, \
    FirmwareDownloadResource, FirmwareCheckResource


_bp = Blueprint('ota', __name__)
_api = Api(_bp)

# List all available firmwares or add a new one
_api.add_resource(FirmwareListResource, "/ota/firmwares")

# Delete or update an existing firmware
_api.add_resource(FirmwareResource, "/ota/firmwares/<string:firmware_id>")
_api.add_resource(FirmwareDownloadResource, "/ota/firmwares/<string:firmware_id>/download")

_api.add_resource(FirmwareCheckResource, "/ota/update")
