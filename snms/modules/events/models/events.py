# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from datetime import datetime
from marshmallow import Schema, fields, post_load
from dateutil.relativedelta import relativedelta
from snms.core.db import db



class SensorEventAssociation(db.Model):
    """
    Association table for sensors and events
    """
    __tablename__ = 'sensor_event'
    __table_args__ = (
        db.PrimaryKeyConstraint('sensor_id', 'event_id'),
    )

    sensor_id = db.Column(db.Integer, db.ForeignKey('sensors.id', ondelete="CASCADE"))
    event_id = db.Column(db.String, db.ForeignKey('events.id', ondelete="CASCADE"))
    # last_execute = db.Column(db.DateTime)
    # actuator_id = db.Column(db.Integer)

    sensor = db.relationship("Sensor", back_populates="events")
    event = db.relationship("Event", back_populates="sensors")


class Event(db.Model):
    """Events model for scheduling

    unit if repeat is True
    """

    __tablename__ = "events"

    id = db.Column(db.String, primary_key=True)
    name = db.Column(db.String)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'))
    is_active = db.Column(db.Boolean, default=True)

    repeat = db.Column(db.Boolean, default=False)
    unit = db.Column(db.String) # day, week, month, year

    actuator_type = db.Column(db.String)
    config_field = db.Column(db.String)
    config_value = db.Column(db.String)

    start_date = db.Column(db.DateTime)
    next_runtime = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    deleted_at = db.Column(db.DateTime)

    company = db.relationship("Company", back_populates="events")

    sensors = db.relationship(
        "SensorEventAssociation",
        back_populates="event", cascade="all, delete-orphan")


class EventSchema(Schema):
    """Schema for events"""
    id = fields.String(dump_only=True)
    name = fields.String(required=True)
    is_active = fields.Boolean(missing=False)
    repeat = fields.Boolean(missing=False)
    unit = fields.String(missing='day')
    next_runtime = fields.DateTime(dump_only=True)
    start_date = fields.DateTime(required=True)
    actuator_type = fields.String(required=True)
    config_field = fields.String(required=True)
    config_value = fields.String(required=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

    @post_load(pass_many=False)
    def update_start_date(self, data):
        try:
            data['start_date'] = data['start_date'].replace(tzinfo=None) - data['start_date'].utcoffset()
        except Exception as e:
            print(e)
        return data


def get_next_runtime(start_date, repeat=False, unit='day'):
    start_date = start_date.replace(second=0, microsecond=0)
    if start_date > datetime.utcnow():
        return start_date
    elif repeat:
        rd = relativedelta(datetime.utcnow(), start_date)
        if not unit:
            unit = 'day'
        if unit == 'day':
            return start_date + relativedelta(years=+rd.years, months=+rd.months, days=+rd.days+1)
        if unit == 'week':
            return start_date + relativedelta(years=+rd.years, months=+rd.months, weeks=+rd.weeks+1, weekday=start_date.weekday())
        if unit == 'month':
            return start_date + relativedelta(years=+rd.years, months=+rd.months+1)
        if unit == 'year':
            return start_date + relativedelta(years=+rd.years+1)