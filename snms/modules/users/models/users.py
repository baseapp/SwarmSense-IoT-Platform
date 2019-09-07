# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from __future__ import unicode_literals

from datetime import datetime
from sqlalchemy.event import listens_for

from snms.core.db import db


class User(db.Model):
    """User database model."""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    uid = db.Column(db.String, unique=True)
    name = db.Column(db.String)
    email = db.Column(db.String, unique=True)
    password = db.Column(db.String)
    phone = db.Column(db.String)
    data = db.Column(db.Text)
    role = db.Column(db.String, default='user')
    reset_password = db.Column(db.Boolean, default=False)
    reset_code = db.Column(db.String, nullable=True)
    verification_code = db.Column(db.String, nullable=True)
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    deleted = db.Column(db.Boolean, default=False)

    own_companies = db.relationship("Company", back_populates="owner", cascade="all, delete, delete-orphan")

    companies = db.relationship(
        "CompanyUserAssociation",
        back_populates="user")

    def __repr__(self):
        return "<User(name='%s', email='%s', role='%s')>" % (
            self.name, self.email, self.role)

    # @property
    def is_super_admin(self):
        """Check if user is super admin or not."""
        return self.role == 'super_admin'

    def can_be_modified(self, user):
        """If this user can be modified by the given user"""
        return self == user or user.is_super_admin


@listens_for(User.deleted, 'set')
def _user_deleted(target, value, *rest):
    pass