# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from __future__ import unicode_literals

from flask import Blueprint
from flask_restful import Api

from snms.modules.alerts.controllers import AlertHistoryResource, \
    AlertResource, AlertsCollectionResource
from snms.modules.alerts.sensor_alert import SensorAlertResource
from snms.modules.alerts.network_alerts import NetworkAlertResource


_bp = Blueprint('alerts', __name__)
_api = Api(_bp)

_api.add_resource(AlertsCollectionResource, '/companies/<string:company_id>/alerts')
_api.add_resource(AlertResource, '/alerts/<string:alert_id>', '/companies/<string:company_id>/alerts/<string:alert_id>')
_api.add_resource(AlertHistoryResource, '/companies/<string:company_id>/alert_history')

_api.add_resource(NetworkAlertResource, '/companies/<string:company_id>/networks/<string:network_id>/alerts')
_api.add_resource(SensorAlertResource, '/sensors/<string:sensor_id>/alerts')