# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from snms.core.db import db


class UserMetaData(db.Model):
    """Database model for user meta details"""
    __tablename__ = 'users_meta_data'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"))
    key = db.Column(db.String)
    value = db.Column(db.String)
    description = db.Column(db.String)

    unique_user_key = db.UniqueConstraint('user_id', 'key')