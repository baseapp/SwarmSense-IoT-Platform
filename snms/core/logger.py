# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

import copy
import logging
import logging.config
import logging.handlers
import os
from configparser import ConfigParser

from flask.helpers import get_root_path
from snms.core.management.color import color_style
import snms


from flask import has_request_context, request

from snms.core.config import config
# from snms.web.util import get_request_info

LOG_FILE = 'snms.log'


class ConsoleFormatter(logging.Formatter):
    def __init__(self, *args, **kwargs):
        self.style = color_style()
        super().__init__(*args, **kwargs)

    def format(self, record):
        msg = record.msg
        level = record.levelno
        if level:
            if level == logging.DEBUG:
                # Put 2XX first, since it should be the common case
                msg = self.style.DEBUG(msg)
            elif level == logging.INFO:
                msg = self.style.INFO(msg)
            elif level == logging.WARNING:
                msg = self.style.WARNING(msg)
            elif level == logging.ERROR:
                msg = self.style.ERROR(msg)
            elif level == logging.CRITICAL:
                msg = self.style.ERROR(msg)
            else:
                # Any 5XX, or any other status code
                msg = self.style.ERROR(msg)
        record.msg = msg
        return super().format(record)


class Logger:
    """
    Encapsulates the features provided by the standard logging module
    """

    handlers = {}
    default_logging = {
        'version': 1,
        'disable_existing_loggers': False,
        'formatters': {
            'default': {
                'datefmt': '%Y-%m-%d %H:%M:%S',
                'format': '%(asctime)s %(levelname)-8s %(name)s %(module)-15s %(lineno)-3d %(message)s',
            }
        },
        'handlers': {
            'console': {
                'level': 'DEBUG',
                'class': 'logging.StreamHandler',
                'formatter': 'default',
            },
            'file': {
                'level': 'DEBUG',
                'class': 'logging.handlers.RotatingFileHandler',
                'filename': LOG_FILE,
                'maxBytes': 10240000,
                'backupCount': 3,
                'formatter': 'default',
            },
        },
        'loggers': {
            'snms': {
                'handlers': ['console', 'file'],
                'level': 'DEBUG',
            }
        }
    }

    @classmethod
    def initialize(cls):
        cls.default_logging['handlers']['file']['filename'] = cls._log_path(LOG_FILE)
        logging.config.dictConfig(cls.default_logging)

    @classmethod
    def init_app(cls, app):
        """
        Initialize Flask app logging (add Sentry if needed)
        """
        cls.initialize()

        if 'sentry' in config.LOGGERS:
            from raven.contrib.flask import Sentry
            app.config['SENTRY_CONFIG'] = {
                'dsn': config.SENTRY_DSN,
                'release': snms.__version__
            }
            # app.config['SENTRY_DSN'] = config.getSentryDSN()

            # Plug into both Flask and `logging`
            Sentry(app, logging=True, level=getattr(logging, config.SENTRY_LOGGING_LEVEL))

    @classmethod
    def get(cls, module=None):
        """Get a logger with the given name.
        This behaves pretty much like `logging.getLogger`, except for
        prefixing any logger name with ``snms.`` (if not already
        present).
        """
        if module is None:
            module = 'snms'
        elif module != 'snms' and not module.startswith('snms.'):
            module = 'snms.' + module
        return logging.getLogger(module)

    @classmethod
    def _log_path(cls, fname):

        # If we have no config file we are most likely running tests.
        # Doesn't make sense to log anything in this case.
        if config.LOG_DIR is None:
            fpath = os.path.join(get_root_path('snms'), 'log/snms.log')
            if os.access(os.path.dirname(fpath), os.W_OK):
                return fpath.replace('\\', '\\\\')
            return os.devnull

        for fpath in (os.path.join(config.LOG_DIR, fname), os.path.join(os.getcwd(), 'snms.log')):
            if os.access(os.path.dirname(fpath), os.W_OK):
                return fpath.replace('\\', '\\\\')
        else:
            raise IOError("Log file can't be written")

