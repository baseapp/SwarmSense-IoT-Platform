# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from __future__ import unicode_literals

from snms.core import signals
from snms.modules.settings.models.settings import Setting, get_all_settings, get_mail_options
from snms.modules.settings.defaults import default_options
from snms.modules.settings.converters import convert_settings

__all__ = ('Setting', 'get_all_settings', 'get_mail_options')


@signals.app_created.connect
def load_settings(app, **kwargs):

    @app.context_processor
    def inject_public_settings():
        """Add public settings to template"""
        public_options = get_mail_options()
        return public_options
