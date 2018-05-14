# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Settings Web Model"""

from snms.core.db import db


class Setting(db.Model):
    """Web settings model"""

    __tablename__ = 'settings'

    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String, unique=True)
    value = db.Column(db.String)
    label = db.Column(db.String)
    group = db.Column(db.String)
    access = db.Column(db.String, default='public')
    description = db.Column(db.String)
    order = db.Column(db.Integer, default=1)


def get_all_settings():
    """Get all web settings"""
    try:
        settings = Setting.query.all()
        return {setting.key: setting.value for setting in settings}
    except Exception as e:
        return {}

def get_mail_options():
    """Get public settings from email templates"""
    settings = Setting.query.all()
    return {"setting_{}".format(setting.key): setting.value for setting in settings if setting.access == 'public'}