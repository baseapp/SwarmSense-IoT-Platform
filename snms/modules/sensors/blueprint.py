# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from __future__ import unicode_literals

from flask import Blueprint, make_response
import json
from flask_restful import Api
import datetime

from snms.modules.sensors.controllers import SensorsCollectionResource, \
    SensorsResource, SensorConfigResource, SensorHIDResource, SensorValueResource, \
    SensorHIDValuesResources, SensorsByTypeResource, SensorHistoryResource, \
    SensorDataExportResource, SensorAggregateResource, SensorHIDConfigResource, \
    SensorHIDConfigAck

from snms.modules.sensors.sensor_types_controller import SensorTypesCollectionResource, \
    SensorTypeResource, AllSensorTypes, SensorDataTypes

_bp = Blueprint('sensors', __name__)
_api = Api(_bp)


def default(o):
    if isinstance(o, datetime.time):
        return o.isoformat()


@_api.representation('application/json')
def output_json(data, code, headers=None):
    resp = make_response(json.dumps(data, default=default), code)
    resp.headers.extend(headers or {})
    return resp

_api.add_resource(SensorsCollectionResource, '/companies/<string:company_id>/sensors')
_api.add_resource(SensorHIDResource, '/companies/<string:company_id>/sensor_by_hid/<string:sensor_hid>')
_api.add_resource(SensorHIDValuesResources, '/companies/<string:company_id>/sensor_by_hid/<string:sensor_hid>/values')
_api.add_resource(SensorsByTypeResource,
                  '/companies/<string:company_id>/sensors_by_type/<string:sensor_type>')

_api.add_resource(SensorsResource, '/sensors/<string:sensor_id>',
                  '/companies/<string:company_id>/sensors/<string:sensor_id>')
_api.add_resource(SensorConfigResource, '/sensors/<string:sensor_id>/configuration')
_api.add_resource(SensorHIDConfigResource, '/companies/<string:company_id>/sensor_by_hid/<string:sensor_hid>/configuration')
_api.add_resource(SensorHIDConfigAck, '/companies/<string:company_id>/sensor_by_hid/<string:sensor_hid>/configuration/ack')
_api.add_resource(SensorValueResource, '/sensors/<string:sensor_id>/values')
_api.add_resource(SensorHistoryResource, '/sensors/<string:sensor_id>/history')
_api.add_resource(SensorDataExportResource, '/sensors/<string:sensor_id>/export')
_api.add_resource(SensorAggregateResource, '/sensors/<string:sensor_id>/aggregate')

_api.add_resource(SensorTypesCollectionResource, '/sensor_types')
_api.add_resource(SensorTypeResource, '/sensor_types/<string:sensor_type_id>')
_api.add_resource(AllSensorTypes, '/sensor_types_all', "/sensor_types_all/<sensor_type>")
_api.add_resource(SensorDataTypes, '/sensor_data_types')
