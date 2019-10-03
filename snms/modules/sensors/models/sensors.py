# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Sensors database model."""
from datetime import datetime, time
from snms.database import tsdb
from snms.core.db import db, query_callable, regions


class Sensor(db.Model):
    """
    Sensor database model.

    This is a common model for all type of sensors. It have some general
    columns to save sensor details.

    """
    __tablename__ = 'sensors'
    __table_args__ = (
        db.UniqueConstraint('company_id', 'hid', name="sensors_unique_company_id_hid"),
    )

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    type = db.Column(db.String(100))
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'))
    description = db.Column(db.String)
    location_lat = db.Column(db.Float)
    location_long = db.Column(db.Float)
    uid = db.Column(db.String, unique=True)
    hid = db.Column(db.String)
    # TODO: Key field size update.
    key = db.Column(db.String)
    is_down = db.Column(db.Boolean, default=False)
    is_inactive = db.Column(db.Boolean, default=False)
    deleted = db.Column(db.Boolean, default=False)
    ip = db.Column(db.String)
    last_update = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    config_updated = db.Column(db.DateTime)

    value = db.Column(db.JSON)
    config = db.Column(db.JSON)

    time_start = db.Column(db.Time, default=time.min)
    time_end = db.Column(db.Time, default=time.max)

    # TODO: Add heart_beat(DateTime) field
    networks = db.relationship(
        "Network",
        secondary='network_sensor',
        back_populates="sensors")
    company = db.relationship("Company", back_populates="sensors")

    alerts = db.relationship(
        "SensorAlertAssociation",
        back_populates="sensor")

    events = db.relationship(
        "SensorEventAssociation",
        back_populates="sensor")

    sensor_type = db.relationship(
        "SensorType", foreign_keys=[type], primaryjoin='Sensor.type == SensorType.type'
    )




class SensorType(db.Model):
    """
    Sensor types model.
    """
    __tablename__ = "sensor_types"

    # query_class = query_callable(regions)

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    # Title for Sensor Type
    title = db.Column(
        db.String
    )

    # type for sensor type. lower case unique name
    type = db.Column(
        db.String,
        unique=True
    )

    # Inactivity duration after which sensor will be assumed as down.
    status_timeout = db.Column(
        db.Integer
    )

    # Is this sensor type is available to all users. Created by Admin User
    is_public = db.Column(
        db.Boolean,
        default=True
    )

    # Created by the user
    created_by = db.Column(
        db.Integer,
        db.ForeignKey('users.id')
    )

    value_fields = db.Column(db.JSON)
    config_fields = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    # TODO: Use deleted_at(Timestamp for soft deletes)
    deleted = db.Column(db.Boolean, default=False)

    # owner = db.relationship("User", back_populates="sensor_types")


def get_all_types():
    """Get all sensor types"""
    sensors = SensorType.query.filter(SensorType.deleted == False).all()
    types = {sensor.type: {
        "title": sensor.title,
        "type": sensor.type,
        "status_timeout": sensor.status_timeout,
        "fields": sensor.value_fields,
        "config_fields": sensor.config_fields
    } for sensor in sensors}
    return types