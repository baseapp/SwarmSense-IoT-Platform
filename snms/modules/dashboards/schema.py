# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Dashboard Schemas"""
from marshmallow import Schema, fields


class DashboardSchema(Schema):
    id = fields.String(dump_only=True)
    data = fields.Dict(missing={})
    sensor_type = fields.String()
    dashboard_type = fields.String()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class WidgetSchema(Schema):
    id = fields.String(dump_only=True)
    dashboard_id = fields.String(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    data = fields.Dict()