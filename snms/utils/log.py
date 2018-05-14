import logging
import logging.config  # needed when logging_config doesn't start with logging.config
from copy import copy
import os

from snms.core.config import config
from snms.core.management.color import color_style
from snms.utils.module_loading import import_string

LOG_FILE = 'snms.log'
# Default logging for snms. This sends an email to the site admins on every
# HTTP 500 error. Depending on DEBUG, all other log records are either sent to
# the console (DEBUG=True) or discarded (DEBUG=False) by means of the
# require_debug_true filter.
DEFAULT_LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'snms.utils.log.RequireDebugFalse',
        },
        'require_debug_true': {
            '()': 'snms.utils.log.RequireDebugTrue',
        },
    },
    'formatters': {
        'verbose': {
            '()': 'snms.utils.log.ConsoleFormatter',
            'format': '%(asctime)s %(levelname)s %(module)-15s %(lineno)-3d %(message)s'
        },
        'default': {
            'datefmt': '%Y-%m-%d %H:%M:%S',
            'format': '%(asctime)s %(levelname)-8s %(module)-15s %(lineno)-3d %(message)s',
        }
    },
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'filters': ['require_debug_true'],
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
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


def configure_logging(logging_config, logging_settings):
    if logging_config:
        # First find the logging configuration function ...
        logging_config_func = import_string(logging_config)

        logging.config.dictConfig(DEFAULT_LOGGING)

        # ... then invoke it with the logging settings
        if logging_settings:
            logging_config_func(logging_settings)


class CallbackFilter(logging.Filter):
    """
    A logging filter that checks the return value of a given callable (which
    takes the record-to-be-logged as its only parameter) to decide whether to
    log a record.
    """
    def __init__(self, callback):
        self.callback = callback

    def filter(self, record):
        if self.callback(record):
            return 1
        return 0


class RequireDebugFalse(logging.Filter):
    def filter(self, record):
        return not config.DEBUG


class RequireDebugTrue(logging.Filter):
    def filter(self, record):
        return config.DEBUG


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

