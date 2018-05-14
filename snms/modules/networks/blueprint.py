# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from __future__ import unicode_literals

from flask import Blueprint
from flask_restful import Api

from snms.modules.networks.controllers import NetworksCollectionResource, NetworksResource, \
    NetworksSensorsCollectionResource, FloorMapResource

_bp = Blueprint('networks', __name__)
_api = Api(_bp)


_api.add_resource(NetworksCollectionResource, '/companies/<string:company_id>/networks')
_api.add_resource(NetworksResource, '/companies/<string:company_id>/networks/<string:network_id>')
_api.add_resource(
    NetworksSensorsCollectionResource,
    '/companies/<string:company_id>/networks/<string:network_id>/sensors'
)
_api.add_resource(
    FloorMapResource,
    '/companies/<string:company_id>/networks/<string:network_id>/floormap'
)
