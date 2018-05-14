# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from __future__ import unicode_literals

from datetime import datetime
from snms.core.db import db
from snms.const import C_ROLE_DEFAULT


class CompanyUserAssociation(db.Model):
    """Association table for sensors and alerts"""
    __tablename__ = 'company_user'
    __table_args__ = (
        db.PrimaryKeyConstraint('user_id', 'company_id'),
    )

    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"))
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id', ondelete="CASCADE"))
    role = db.Column(db.String, default=C_ROLE_DEFAULT)

    user = db.relationship("User", back_populates="companies")
    company = db.relationship("Company", back_populates="users")


class Company(db.Model):
    __tablename__ = 'companies'

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(db.String)

    owner_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id')
    )

    deleted = db.Column(
        db.Boolean,
        default=False
    )

    uid = db.Column(
        db.String,
        unique=True
    )

    key = db.Column(db.String)

    owner = db.relationship(
        "User",
        back_populates="own_companies",
        lazy="joined"
    )

    sensors = db.relationship(
        "Sensor",
        back_populates="company",
        cascade="all, delete, delete-orphan"
    )

    networks = db.relationship(
        "Network",
        back_populates="company",
        cascade="all, delete, delete-orphan"
    )

    alerts = db.relationship(
        "Alert",
        back_populates="company",
        cascade="all, delete, delete-orphan"
    )

    events = db.relationship(
        "Event",
        back_populates="company",
        cascade="all, delete, delete-orphan"
    )

    users = db.relationship(
        "CompanyUserAssociation",
        back_populates="company"
    )

    def __repr__(self):
        return "<Company(uid='%s' name='%s')>" % (self.uid, self.name)


class UserInvite(db.Model):
    __tablename__ = 'user_invites'

    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'))
    email = db.Column(db.String(200))
    role = db.Column(db.String(20), default=C_ROLE_DEFAULT)
    status = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.now())