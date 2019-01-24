# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from __future__ import absolute_import

import ast
import os
import socket
import codecs
import re
import warnings
from datetime import timedelta

import pytz
from celery.schedules import crontab
from flask import g, current_app
from flask.helpers import get_root_path
from werkzeug.urls import url_parse
from werkzeug.datastructures import ImmutableDict

from snms.utils.fs import resolve_link
from snms.utils.packaging import package_is_editable
from snms.utils.string import snakify, crc32
from snms.utils.caching import make_hashable

DEFAULTS = {
    'AUTH_PROVIDERS': {},
    'BASE_URL': None,
    'CACHE_BACKEND': 'files',
    'CACHE_DIR': '/opt/snms/cache',
    'CELERY_BROKER': None,
    'CELERY_CONFIG': {},
    'CELERY_RESULT_BACKEND': None,
    'DB_LOG': False,
    'DEBUG': False,
    'DEFAULT_LOCALE': 'en_GB',
    'DEFAULT_TIMEZONE': 'UTC',
    'FLOWER_URL': None,
    'LOGGING_CONFIG_FILE': 'logging.yaml',
    'LOGO_URL': None,
    'LOG_DIR': None,
    'LOGGING_LEVEL': 'WARNING',
    'MAX_UPLOAD_FILES_TOTAL_SIZE': 0,
    'MAX_UPLOAD_FILE_SIZE': 0,
    'MEMCACHED_SERVERS': [],
    'PLUGINS': set(),
    'PROPAGATE_ALL_EXCEPTIONS': False,
    'PROVIDER_MAP': {},
    'REDIS_CACHE_URL': None,
    'SCHEDULED_TASK_OVERRIDE': {},
    'SCSS_DEBUG_INFO': True,
    'SECRET_KEY': '0123456789abcdefgh',
    'SENTRY_DSN': None,
    'SENTRY_LOGGING_LEVEL': 'WARNING',
    'SESSION_LIFETIME': 86400 * 31,
    'EMAIL_TIMEOUT': None,
    'EMAIL_USE_LOCAL_TIME': True,
    'SQLALCHEMY_DATABASE_URI': None,
    'SQLALCHEMY_DATABASE_FILES_URI': None,
    'SQLALCHEMY_MAX_OVERFLOW': 3,
    'SQLALCHEMY_POOL_RECYCLE': 120,
    'SQLALCHEMY_POOL_SIZE': 5,
    'SQLALCHEMY_POOL_TIMEOUT': 10,
    'TSDB_HOST': 'localhost',
    'TSDB_PORT': 8086,
    'TSDB_USERNAME': 'root',
    'TSDB_PASSWORD': 'root',
    'TSDB_DB': 'snms',
    'STATIC_FILE_METHOD': None,
    'STATIC_SITE_STORAGE': None,
    'STORAGE_BACKENDS': {'default': 'fs:/opt/snms/uploads'},
    'STRICT_LATEX': True,
    'TEMP_DIR': '/opt/snms/tmp',
    'USE_PROXY': False,
    'WORKER_NAME': socket.getfqdn(),
    'XELATEX_PATH': 'xelatex',
    'TWILIO_DEFAULT_SENDER': None,
    'TWILIO_ACC_SID': None,
    'TWILIO_AUTH_TOKEN': None,
    'UID_PREFIX': '',
    'UID_LENGTH': 12,
    'LOGGERS': ['file'],
    'MQTT_USERNAME': None,
    'MQTT_PASSWORD': None,
    'MQTT_BROKER_URL': None,
    'MQTT_BROKER_PORT': 1883,
    'MQTT_TLS_ENABLED': False,
    'MQTT_KEEPALIVE': 60,
    'MQTT_LAST_WILL_TOPIC': None,
    'MQTT_LAST_WILL_MESSAGE': None,
    'MQTT_LAST_WILL_QOS': None,
    'MQTT_TLS_CA_CERTS': None,
    'MQTT_LAST_WILL_RETAIN': None,
    'MQTT_TLS_CERTFILE': None,
    'MQTT_TLS_KEYFILE': None,
    'MQTT_TLS_CERT_REQS': None,
    'MQTT_TLS_VERSION': None,
    'MQTT_TLS_CIPHERS': None,
    'MQTT_TLS_INSECURE': None,
    'FLOORMAP_STORAGE': 'default',
}

# Default values for settings that cannot be set in the config file
INTERNAL_DEFAULTS = {
    'CONFIG_PATH': os.devnull,
    'CONFIG_PATH_RESOLVED': None,
    'LOGGING_CONFIG_PATH': None,
    'TESTING': False
}


def get_config_path():
    """Get the path of the snms config file.

    This may return the location of a symlink.  Resolving a link is up
    to the caller if needed.
    """
    old_home = os.environ.pop('HOME', None)
    # env var has priority
    try:
        return os.path.expanduser(os.environ['SNMS_CONFIG'])
    except KeyError:
        pass
    # try finding the config in various common paths
    paths = [os.path.expanduser('~/.snms.conf'), '/etc/snms.conf']
    # Keeping HOME unset wouldn't be too bad but let's not have weird side-effects
    if old_home is not None:
        os.environ['HOME'] = old_home
    # If it's an editable setup (ie usually a dev instance) allow having
    # the config in the package's root path
    if package_is_editable('snms'):
        paths.insert(0, os.path.normpath(os.path.join(get_root_path('snms'), 'snms.conf')))
    for path in paths:
        if os.path.exists(path):
            return path
    raise Exception('No snms config found. Point the SNMS_CONFIG env var to your config file or '
                    'move/symlink the config in one of the following locations: {}'.format(', '.join(paths)))


def _parse_config(path):
    globals_ = {'timedelta': timedelta, 'crontab': crontab}
    locals_ = {}
    with codecs.open(path, encoding='utf-8') as config_file:
        # XXX: unicode_literals is inherited from this file
        exec(compile(config_file.read(), path, 'exec'), globals_, locals_)
    return {str(k if k.isupper() else _convert_key(k)): v
            for k, v in locals_.items()
            if k[0] != '_'}


def _convert_key(name):
    # camelCase to BIG_SNAKE while preserving acronyms, i.e.
    # FooBARs -> FOO_BARS (and not FOO_BA_RS)
    name = re.sub(r'([A-Z])([A-Z]+)', lambda m: m.group(1) + m.group(2).lower(), name)
    name = snakify(name).upper()
    special_cases = {'PDFLATEX_PROGRAM': 'XELATEX_PATH',
                     'SCSSDEBUG_INFO': 'SCSS_DEBUG_INFO'}
    return special_cases.get(name, name)


def _postprocess_config(data):
    if data['DEFAULT_TIMEZONE'] not in pytz.all_timezones_set:
        raise ValueError('Invalid default timezone: {}'.format(data['DEFAULT_TIMEZONE']))
    # data['BASE_URL'] = data['BASE_URL'].rstrip('/')
    # data['STATIC_SITE_STORAGE'] = data['STATIC_SITE_STORAGE'] or data['ATTACHMENT_STORAGE']


def _sanitize_data(data, allow_internal=False):
    allowed = set(DEFAULTS)
    if allow_internal:
        allowed |= set(INTERNAL_DEFAULTS)
    for key in set(data) - allowed:
        warnings.warn('Ignoring unknown config key {}'.format(key))
    return {k: v for k, v in data.items() if k in allowed}


def load_config(only_defaults=False, override=None):
    """Load the configuration data.
    :param only_defaults: Whether to load only the default options,
                          ignoring any user-specified config file
                          or environment-based overrides.
    :param override: An optional dict with extra values to add to
                     the configuration.  Any values provided here
                     will override values from the config file.
    """
    data = dict(DEFAULTS, **INTERNAL_DEFAULTS)
    if not only_defaults:
        path = get_config_path()
        config = _sanitize_data(_parse_config(path))
        data.update(config)
        env_override = os.environ.get('SNMS_CONF_OVERRIDE')
        if env_override:
            data.update(_sanitize_data(ast.literal_eval(env_override)))
        resolved_path = resolve_link(path) if os.path.islink(path) else path
        resolved_path = None if resolved_path == os.devnull else resolved_path
        data['CONFIG_PATH'] = path
        data['CONFIG_PATH_RESOLVED'] = resolved_path
        if resolved_path is not None:
            data['LOGGING_CONFIG_PATH'] = os.path.join(os.path.dirname(resolved_path), data['LOGGING_CONFIG_FILE'])

    if override:
        data.update(_sanitize_data(override, allow_internal=True))
    _postprocess_config(data)
    return ImmutableDict(data)


class SNMSConfig(object):
    """Wrapper for the SNMS configuration.
    It exposes all config keys as read-only attributes.
    Dynamic configuration attributes whose value may change depending
    on other factors may be added as properties, but this should be
    kept to a minimum and is mostly there for legacy reasons.
    :param config: The dict containing the configuration data.
                   If omitted, it is taken from the active flask
                   application.  An explicit configuration dict should
                   not be specified except in special cases such as
                   the initial app configuration where no app context
                   is available yet.
    :param exc: The exception to raise when accessing an invalid
                config key.  This allows using the expected kind of
                exception in most cases but overriding it when
                exposing settings to Jinja where the default
                :exc:`AttributeError` would silently be turned into
                an empty string.
    """

    __slots__ = ('_config', '_exc')

    def __init__(self, config=None, exc=AttributeError):
        # yuck, but we don't allow writing to attributes directly
        object.__setattr__(self, '_config', config)
        object.__setattr__(self, '_exc', exc)

    @property
    def data(self):
        try:
            return self._config or current_app.config['SNMS']
        except KeyError:
            raise RuntimeError('config not loaded')

    @property
    def hash(self):
        return crc32(repr(make_hashable(sorted(self.data.items()))))

    @property
    def IMAGES_BASE_URL(self):
        return 'static/images' if g.get('static_site') else url_parse('{}/images'.format(self.BASE_URL)).path

    def __getattr__(self, name):
        try:
            return self.data[name]
        except KeyError:
            raise self._exc('no such setting: ' + name)

    def __setattr__(self, key, value):
        raise AttributeError('cannot change config at runtime')

    def __delattr__(self, key):
        raise AttributeError('cannot change config at runtime')


#: The global SNMS configuration
config = SNMSConfig()
