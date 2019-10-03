# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from __future__ import unicode_literals

from datetime import datetime
from marshmallow import Schema, fields, validates_schema, ValidationError, pre_dump, pre_load

from snms.const import ALERT_TYPES_ALL, ALERT_TYPES_COMMON, ALERT_ACTION_NITIFICATION, ALERT_ACTION_TRIGGER
from snms.core.db import db
from snms.modules.sensors import get_all_types


class SensorAlertAssociation(db.Model):
    """
    Association table for sensors and alerts

    actuator_id: Change config value of Sensor on alert.
    If alert action is a trigger type the actuator_id will be required.
    """
    __tablename__ = 'sensor_alert'
    __table_args__ = (
        db.PrimaryKeyConstraint('sensor_id', 'alert_id'),
    )

    sensor_id = db.Column(db.Integer, db.ForeignKey('sensors.id', ondelete="CASCADE"))
    alert_id = db.Column(db.Integer, db.ForeignKey('alerts.id', ondelete="CASCADE"))
    last_execute = db.Column(db.DateTime)
    actuator_id = db.Column(db.Integer)

    sensor = db.relationship("Sensor", back_populates="alerts")
    alert = db.relationship("Alert", back_populates="sensors")


class NetworkAlertAssociation(db.Model):
    """Association table for network alerts"""
    __tablename__ = 'network_alerts'
    __table_args__ = (
        db.PrimaryKeyConstraint('alert_id', 'network_id'),
    )

    network_id = db.Column(db.Integer, db.ForeignKey('networks.id', ondelete="CASCADE"))
    alert_id = db.Column(db.Integer, db.ForeignKey('alerts.id', ondelete="CASCADE"))

    networks = db.relationship("Network", back_populates="alerts")
    alert = db.relationship("Alert", back_populates="networks")


class SensorAlertStatus(db.Model):
    """Association table for sensors and alerts"""
    __tablename__ = 'sensor_alert_status'
    __table_args__ = (
        db.PrimaryKeyConstraint('sensor_id', 'alert_id'),
    )

    sensor_id = db.Column(db.Integer, db.ForeignKey('sensors.id', ondelete="CASCADE"))
    alert_id = db.Column(db.Integer, db.ForeignKey('alerts.id', ondelete="CASCADE"))
    last_execute = db.Column(db.DateTime)
    triggered = db.Column(db.Boolean)


class Alert(db.Model):
    """
    Alerts database model.

    Table Name: alerts

    Columns:-
    id: Unique ID, Primary Key
    name: Name of the notification
    company_id: Company ID
    type: Alert type [ less_then, equal_to, grater_then, geo_in, geo_out, ... ]
    value: Compare Value
    between_start: Check for alerts between duration
    between_end: Check for alerts between duration
    send_to:
    send_method:

    created_at: Alert added on
    """
    __tablename__ = 'alerts'

    id = db.Column(db.Integer, primary_key=True)
    uid = db.Column(db.String, unique=True)
    name = db.Column(db.String)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'))
    type = db.Column(db.String)
    sensor_type = db.Column(db.String)
    value = db.Column(db.String)
    field = db.Column(db.String)
    between_start = db.Column(db.Time)
    between_end = db.Column(db.Time)
    snooze = db.Column(db.Integer)
    threshold_duration = db.Column(db.Integer, default=0)  # Trigger only if alert is active for this duration in minutes
    alert_text = db.Column(db.String)
    recipients = db.Column(db.JSON)
    web_hooks = db.Column(db.JSON)
    alert_if = db.Column(db.String)  # Alert if point is inside or outside
    polygon = db.Column(db.JSON)
    is_active = db.Column(db.Boolean, default=True)
    deleted = db.Column(db.Boolean, default=False)

    action_type = db.Column(db.String, default=ALERT_ACTION_NITIFICATION)
    actuator_type = db.Column(db.String)
    config_field = db.Column(db.String)
    config_value = db.Column(db.String)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    company = db.relationship("Company", back_populates="alerts")
    sensors = db.relationship(
        "SensorAlertAssociation",
        back_populates="alert", cascade="all, delete-orphan")
    networks = db.relationship(
        "NetworkAlertAssociation",
        back_populates="alert", cascade="all, delete-orphan")


class AlertSchema(Schema):
    """Schema for alerts"""
    uid = fields.String(dump_only=True, dump_to='id')
    name = fields.String(required=True)
    type = fields.String(required=True)
    sensor_type = fields.String(required=True)
    value = fields.String(allow_none=True, missing='0')
    field = fields.String(missing=None)
    between_start = fields.Time(missing="00:00:00")
    between_end = fields.Time(missing="23:59:59")
    snooze = fields.Integer(missing=None)
    threshold_duration = fields.Integer(missing=0)
    alert_text = fields.String(missing=None)
    recipients = fields.List(fields.Email, missing=[])
    web_hooks = fields.List(fields.Dict, missing=[])
    alert_if = fields.String(missing=None)
    polygon = fields.List(fields.List(fields.Float), missing=[], allow_none=True)
    is_active = fields.Boolean(missing=False)
    created_at = fields.DateTime(dump_only=True)

    action_type = fields.String(missing=ALERT_ACTION_NITIFICATION)
    actuator_type = fields.String(missing=None)
    config_field = fields.String(missing=None)
    config_value = fields.String(missing=None)

    #
    # @pre_load
    # def check_action_type(self, data):
    #     if 'action_type' in list(data.keys()) and data['action_type'] == ALERT_ACTION_TRIGGER:
    #         self.fields['snooze'].required = False
    #         self.fields['alert_text'].required = False
    #
    #         self.fields['config_field'].required = True
    #         self.fields['config_field'].allow_none = False
    #         self.fields['actuator_type'].allow_none = False
    #         self.fields['config_value'].allow_none = False
    #     return data

    @pre_dump
    def add_action_type(self, alert):
        if not alert.action_type:
            alert.action_type = ALERT_ACTION_NITIFICATION
        return alert

    @validates_schema
    def valida_types(self, data):
        """Validate sensor type with alert type and field"""
        all_sensor_types = get_all_types()
        sensor_type = data['sensor_type']
        if data['type'] not in ALERT_TYPES_ALL:
            raise ValidationError("Invalid alert type", "type")
        if sensor_type == 'all':
            if data["type"] not in ALERT_TYPES_COMMON:
                raise ValidationError(
                    'Invalid alert type for sensor type all. Valid values are: {}'.format(
                        ", ".join(ALERT_TYPES_COMMON)
                    ), "type")
        elif sensor_type in all_sensor_types.keys():
            if not data['field'] and data["type"] not in ALERT_TYPES_COMMON:
                raise ValidationError("'field' is required", 'field')
            if data['field'] not in all_sensor_types[sensor_type]['fields'].keys():
                raise ValidationError("field is invalid for sensor type: {}".format(sensor_type),
                                      "field")
        else:
            raise ValidationError('Invalid sensor_type. Valid values are: all, {}'.format(
                ", ".join(all_sensor_types.keys())), 'sensor_type')

        if not "action_type" in data.keys():
            data["action_type"] = ALERT_ACTION_NITIFICATION

        if data["action_type"] == ALERT_ACTION_TRIGGER:
            required_fields = ['actuator_type', 'config_field', 'config_value']
        else:
            required_fields = ['snooze', 'alert_text']
        for f in required_fields:
            if f not in data.keys() or data[f] is None:
                raise ValidationError("%s is required for action_type = %s" % (f, data['action_type']), f)