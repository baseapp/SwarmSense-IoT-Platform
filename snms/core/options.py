# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Snms Setting Options"""
from flask import current_app

from snms.core.logger import Logger
from snms.core.signals.core import settings_changed
from snms.modules.settings import get_all_settings, convert_settings, default_options

_LOGGER = Logger.get(__name__)

try:
    from flask import _app_ctx_stack as stack
except ImportError:
    from flask import _request_ctx_stack as stack


class Options(object):

    def __init__(self, app=None):
        self.app = app
        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        # if hasattr(app, 'teardown_appcontext'):
        #     app.teardown_appcontext(self.teardown)
        # else:
        #     app.teardown_request(self.teardown)
        settings_changed.connect(self._load_options)

    def _load_options(self, sender, **extra):
        _LOGGER.debug("Load options called")
        ctx = stack.top
        if ctx is not None:
            settings_db = get_all_settings()
            data = convert_settings(settings_db, default_options)
            ctx.snms_options = data

    def teardown(self, exception):
        ctx = stack.top
        if hasattr(ctx, 'snms_options'):
            ctx.snms_options = None

    @property
    def option(self):
        ctx = stack.top
        if ctx is not None:
            if not hasattr(ctx, 'snms_options'):
                settings_db = get_all_settings()
                data = convert_settings(settings_db, default_options)
                ctx.snms_options = data
            return ctx.snms_options

options = Options()