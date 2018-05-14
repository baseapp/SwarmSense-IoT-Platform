# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Common request validation and parsing schemas"""

from marshmallow import Schema, fields, post_load


class EmailSchema(Schema):
    """Schema for email validation"""
    email = fields.Email(required=True)

    @post_load
    def lowerstrip_email(self, item):
        item['email'] = item['email'].lower().strip()
        return item


class SignupSchema(EmailSchema):
    """Schema for signup request and validation"""
    name = fields.String(required=True)
    password = fields.String(required=True)
    company_name = fields.String(missing="My Company")


class AddUserSchema(SignupSchema):
    """Schema to add new user"""
    role = fields.String(default="user", missing="user")
    phone = fields.String(missing=None)


class PasswordResetSchema(EmailSchema):
    """Reset password schema"""
    password = fields.String(required=True)
    code = fields.String(required=True)


class SensorTypeRequestSchema(Schema):
    """Sensor type schema"""
    id = fields.Integer(dump_only=True)
    status_timeout = fields.Integer(missing=5)
    title = fields.String(required=True)
    type = fields.String(dump_only=True)
    value_fields = fields.Dict(load_from="fields", dump_to="fields", required=True, values=fields.Dict(), keys=fields.Str())
    config_fields = fields.Dict(missing=None, values=fields.Dict(), keys=fields.Str())


class AddSettingSchema(Schema):
    """Add new Setting schema"""
    id = fields.Integer(dump_only=True)
    key = fields.String(required=True)
    value = fields.String(required=True)
    label = fields.String(required=True)
    access = fields.String(missing='public', default='public')
    description = fields.String(allow_none=True)
    order = fields.Integer(missing=10, default=10)
    group = fields.String(missing='general', default='general')