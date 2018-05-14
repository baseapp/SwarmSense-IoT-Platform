# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Common operations for settings."""

from snms.core.db import db
from snms.modules.settings import Setting, get_all_settings
from snms.modules.settings.defaults import default_options


def add_default_settings():
    """Add default settings to database"""
    existing_settings = get_all_settings()
    for option in default_options:
        if option['key'] not in list(existing_settings.keys()):
            setting = Setting()
            setting.populate_from_dict(option, skip=['type', 'options'])
            try:
                if option['type'] == 'boolean':
                    if setting.value:
                        setting.value = '1'
                    else:
                        setting.value = '0'
            except Exception as e:
                pass
            db.session.add(setting)
            db.session.commit()
