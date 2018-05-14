# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from __future__ import unicode_literals

from flask import Blueprint
from flask_restful import Api

from snms.modules.events.controllers import EventHistoryResource, \
    EventResource, EventsCollectionResource
from snms.modules.events.sensor_event import SensorEventResource
# from snms.modules.events.network_alerts import NetworkAlertResource


_bp = Blueprint('events', __name__)
_api = Api(_bp)

_api.add_resource(EventsCollectionResource, '/companies/<string:company_id>/events')
_api.add_resource(EventResource, '/events/<string:event_id>', '/companies/<string:company_id>/events/<string:event_id>')
_api.add_resource(EventHistoryResource, '/companies/<string:company_id>/event_history')

# _api.add_resource(NetworkAlertResource, '/companies/<string:company_id>/networks/<string:network_id>/alerts')
_api.add_resource(SensorEventResource, '/sensors/<string:sensor_id>/events')