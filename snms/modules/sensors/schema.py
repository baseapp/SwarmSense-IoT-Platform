# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from marshmallow import Schema, fields, ValidationError, pre_load, validates_schema
from dateutil import parser
from datetime import datetime, time

from snms.modules.sensors import get_all_types


def validate_sensor_type(t):
    """
    Validate sensor type.
    :param t: Sensor Type
    :return:
    """
    sensor_types = get_all_types()
    if t not in list(sensor_types.keys()):
        raise ValidationError("Invalid sensor type.")


class SensorRequestSchema(Schema):
    """Sensor Request Schema"""
    location_lat = fields.Float(missing=0.000)
    location_long = fields.Float(missing=0.000)
    uid = fields.String(dump_only=True, dump_to='id')
    hid = fields.String(missing=None)
    name = fields.String(required=True)
    description = fields.String(allow_none=True)
    ip = fields.String(dump_only=True)
    type = fields.String(validate=validate_sensor_type)
    key = fields.String(missing=None)
    is_down = fields.Boolean(dump_only=True, missing=False)
    last_update = fields.DateTime(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    value = fields.Dict(allow_none=True)
    config = fields.Dict(allow_none=True)
    time_start = fields.Time(default=time.min, missing=time.min.isoformat(), allow_none=True)
    time_end = fields.Time(default=time.max, missing=time.max.isoformat(), allow_none=True)
    config_updated = fields.DateTime(dump_only=True)


class ValueSchema(Schema):
    """Sensor Value Schema"""
    value = fields.Dict()
    last_update = fields.DateTime(dump_only=True)

    @pre_load
    def add_value(self, data):
        """
        Format the incoming data.
        :param data:
        :return:
        """
        # TODO: Add number of points
        try:
            input_data = {"value": {_k: float(data[_k]) for _k in data.keys() if _k != 'time'}}
            if 'time' in data.keys():
                # Use http://labix.org/python-dateutil#head-c0e81a473b647dfa787dc11e8c69557ec2c3ecd2
                # TODO: Timezone naive issue
                time = parser.parse(data['time'], ignoretz=True)
                now = datetime.utcnow()
                diff = (now - time).days
                if -1 <= diff <= 1:
                    input_data['value']['time'] = data['time']
            return input_data
        except Exception as e:
            raise ValidationError("Invalid data. %{}".format(e))

    @validates_schema(pass_original=True)
    def check_unknown_fields(self, data, original_data):
        """
        Check for unknown fields in Sensor values post data.
        :param data:
        :param original_data:
        """
        sensor_types = get_all_types()
        sensor_type = self.context["type"]
        if sensor_type not in sensor_types.keys():
            raise ValidationError('Sensor Type not defined')
        # unknown = set(original_data) - set(sensor_types[sensor_type]["fields"].keys())
        # if unknown:
        #     raise ValidationError('Unknown field', unknown)
        # for k in original_data.keys():
        #     if type(original_data[k]).__name__ == sensor_types[sensor_type]["fields"][k]["type"]:
        #         pass
        #     else:
        #         raise ValidationError("Invalid Data type", k)
