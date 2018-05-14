# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Dashboard Database model"""
from snms.core.db import db
from datetime import datetime

from snms.utils.crypto import generate_uid


class Dashboard(db.Model):
    """Dashboard ORM Model"""
    __tablename__ = 'dashboards'

    id = db.Column(
        db.String,
        primary_key=True,
        default=generate_uid()
    )

    company_id = db.Column(
        db.Integer,
        db.ForeignKey('companies.id')
    )

    data = db.Column(db.JSON)
    sensor_type = db.Column(db.String)
    dashboard_type = db.Column(db.String)

    deleted = db.Column(
        db.Boolean,
        default=False
    )

    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    created_at = db.Column(db.DateTime, default=datetime.now)

    company = db.relationship(
        "Company",
        backref='dashboards'
    )


class Widget(db.Model):
    """Widget ORM Model"""
    __tablename__ = 'widgets'

    id = db.Column(
        db.String,
        primary_key=True,
        default=generate_uid()
    )
    dashboard_id = db.Column(
        db.String,
        db.ForeignKey('dashboards.id')
    )

    updated_at = db.Column(db.DateTime, default=datetime.now(), onupdate=datetime.now)
    created_at = db.Column(db.DateTime, default=datetime.now())

    data = db.Column(db.JSON)

    dashboard = db.relationship(
        "Dashboard",
        backref='widgets'
    )