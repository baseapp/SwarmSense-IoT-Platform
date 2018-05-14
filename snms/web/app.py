# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from __future__ import absolute_import, unicode_literals

import os
import re
import traceback
import uuid

from flask import Flask, _app_ctx_stack, current_app, request, send_from_directory, jsonify
from flask_sqlalchemy import models_committed
from werkzeug.contrib.fixers import ProxyFix
from werkzeug.exceptions import BadRequest, NotFound
from werkzeug.urls import url_parse

from snms.core.options import options
from snms.core import signals
from snms.core.celery import celery
from snms.core.config import SNMSConfig, config, load_config
from snms.core.db.sqlalchemy import db
from snms.database import tsdb
from snms.core.db.sqlalchemy.core import on_models_committed
from snms.core.db.sqlalchemy.logging import apply_db_loggers
from snms.core.db.sqlalchemy.util.models import import_all_models
from snms.core.logger import Logger
from snms.web.stats import get_request_stats, setup_request_stats
from snms.web.util import (discover_blueprints,)
from snms.web.wrappers import SnmsFlask
from snms.core.mqtt import mqtt


#: Blueprint names for which legacy rules are auto-generated based on the endpoint name
AUTO_COMPAT_BLUEPRINTS = {'admin', 'event', 'event_creation', 'event_mgmt', 'misc', 'rooms', 'rooms_admin'}


def configure_app(app, set_path=False):
    config = SNMSConfig(app.config['SNMS'])
    app.config['DEBUG'] = config.DEBUG
    app.config['SECRET_KEY'] = config.SECRET_KEY
    app.config['LOGGER_NAME'] = 'flask.app'
    app.config['LOGGER_HANDLER_POLICY'] = 'never'
    if not app.config['SECRET_KEY'] or len(app.config['SECRET_KEY']) < 16:
        raise ValueError('SecretKey must be set to a random secret of at least 16 characters. '
                         'You can generate one using os.urandom(32) in Python shell.')
    if config.MAX_UPLOAD_FILES_TOTAL_SIZE > 0:
        app.config['MAX_CONTENT_LENGTH'] = config.MAX_UPLOAD_FILES_TOTAL_SIZE * 1024 * 1024
    app.config['PROPAGATE_EXCEPTIONS'] = True
    # configure_multipass(app)
    app.config['PLUGINENGINE_NAMESPACE'] = 'snms.plugins'
    app.config['PLUGINENGINE_PLUGINS'] = config.PLUGINS
    if set_path and config.BASE_URL:
        base = url_parse(config.BASE_URL)
        app.config['PREFERRED_URL_SCHEME'] = base.scheme
        app.config['SERVER_NAME'] = base.netloc
        if base.path:
            app.config['APPLICATION_ROOT'] = base.path

    if config.USE_PROXY:
        app.wsgi_app = ProxyFix(app.wsgi_app)


def configure_db(app):
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True

    if app.config['TESTING']:
        # tests do not actually use sqlite but run a postgres instance and
        # reconfigure flask-sqlalchemy to use that database.  by setting
        # a dummy uri explicitly instead of letting flask-sqlalchemy do
        # the exact same thing we avoid a warning when running tests.
        app.config.setdefault('SQLALCHEMY_DATABASE_URI', 'sqlite:///:memory:')
    else:
        if config.SQLALCHEMY_DATABASE_URI is None:
            raise Exception("No proper SQLAlchemy store has been configured. Please edit your snms.conf")

        app.config['SQLALCHEMY_DATABASE_URI'] = config.SQLALCHEMY_DATABASE_URI
        app.config['SQLALCHEMY_RECORD_QUERIES'] = False
        app.config['SQLALCHEMY_POOL_SIZE'] = config.SQLALCHEMY_POOL_SIZE
        app.config['SQLALCHEMY_POOL_TIMEOUT'] = config.SQLALCHEMY_POOL_TIMEOUT
        app.config['SQLALCHEMY_POOL_RECYCLE'] = config.SQLALCHEMY_POOL_RECYCLE
        app.config['SQLALCHEMY_MAX_OVERFLOW'] = config.SQLALCHEMY_MAX_OVERFLOW
        files_uri = config.SQLALCHEMY_DATABASE_URI
        try:
            if config.SQLALCHEMY_DATABASE_FILES_URI:
                files_uri = config.SQLALCHEMY_DATABASE_FILES_URI
        except Exception as e:
            pass
        app.config['SQLALCHEMY_BINDS'] = {
            'files': files_uri
        }
    import_all_models()
    db.init_app(app)
    if not app.config['TESTING']:
        apply_db_loggers(app)

    models_committed.connect(on_models_committed, app)


def configure_tsdb(app):
    if app.config['TESTING']:
        return
    app.config['TSDB_HOST'] = config.TSDB_HOST
    app.config['TSDB_PORT'] = config.TSDB_PORT
    app.config['TSDB_USERNAME'] = config.TSDB_USERNAME
    app.config['TSDB_PASSWORD'] = config.TSDB_PASSWORD
    app.config['TSDB_DB'] = config.TSDB_DB

    tsdb.init_app(app)


def configure_mqtt(app):
    app.config['MQTT_USERNAME'] = config.MQTT_USERNAME
    app.config['MQTT_PASSWORD'] = config.MQTT_PASSWORD
    app.config['MQTT_BROKER_URL'] = config.MQTT_BROKER_URL
    app.config['MQTT_BROKER_PORT'] = config.MQTT_BROKER_PORT

    app.config['MQTT_TLS_ENABLED'] = config.MQTT_TLS_ENABLED
    app.config['MQTT_KEEPALIVE'] = config.MQTT_KEEPALIVE
    app.config['MQTT_LAST_WILL_TOPIC'] = config.MQTT_LAST_WILL_TOPIC
    app.config['MQTT_LAST_WILL_MESSAGE'] = config.MQTT_LAST_WILL_MESSAGE
    app.config['MQTT_LAST_WILL_QOS'] = config.MQTT_LAST_WILL_QOS
    app.config['MQTT_LAST_WILL_RETAIN'] = config.MQTT_LAST_WILL_RETAIN

    app.config['MQTT_TLS_CA_CERTS'] = config.MQTT_TLS_CA_CERTS
    app.config['MQTT_TLS_CERTFILE'] = config.MQTT_TLS_CERTFILE
    app.config['MQTT_TLS_KEYFILE'] = config.MQTT_TLS_KEYFILE
    app.config['MQTT_TLS_CERT_REQS'] = config.MQTT_TLS_CERT_REQS
    app.config['MQTT_TLS_VERSION'] = config.MQTT_TLS_VERSION
    app.config['MQTT_TLS_CIPHERS'] = config.MQTT_TLS_CIPHERS
    app.config['MQTT_TLS_INSECURE'] = config.MQTT_TLS_INSECURE

    try:
        if app.config['MQTT_BROKER_URL']:
            mqtt.init_app(app)
            app.config["MQTT_RUNNING"] = True
    except Exception as e:
        app.config["MQTT_RUNNING"] = False

# def extend_url_map(app):
#     app.url_map.converters['list'] = ListConverter


def add_handlers(app):
    # app.after_request(inject_current_url)
    app.register_error_handler(404, handle_404)
    app.register_error_handler(Exception, handle_exception)


def add_blueprints(app):
    blueprints = discover_blueprints()
    for blueprint in blueprints:
        app.register_blueprint(blueprint)


def inject_current_url(response):
    # Make the current URL available. This is useful e.g. in case of
    # AJAX requests that were redirected due to url normalization if
    # we need to know the actual URL
    try:
        # Werkzeug encodes header values as latin1 in Python2.
        # In case of URLs containing utter garbage (usually a 404
        # anyway) they may not be latin1-compatible so let's not
        # add the header at all in this case instead of failing later
        request.relative_url.encode('latin1')
    except UnicodeEncodeError:
        return response
    response.headers['X-snms-URL'] = request.relative_url
    return response


def handle_404(exception):
    try:
        if re.search(r'\.py(?:/\S+)?$', request.path):
            # While not dangerous per se, we never serve *.py files as static
            raise NotFound
        try:
            return send_from_directory(current_app.config['snms_HTDOCS'], request.path[1:], conditional=True)
        except (UnicodeEncodeError, BadRequest):
            raise NotFound
    except NotFound:
        if exception.description == NotFound.description:
            # The default reason is too long and not localized
            description = "The page you are looking for doesn't exist."
        else:
            description = exception.description
        # return render_error("Page not found", description), 404
        return jsonify(), 404


def handle_exception(exception):
    Logger.get('wsgi').exception(exception.message or 'WSGI Exception')
    if current_app.debug:
        raise
    raise
    # return render_error(_("An unexpected error occurred."), str(exception), standalone=True), 500


def make_app(set_path=False, testing=False, config_override=None):
    # If you are reading this code and wonder how to access the app:
    # >>> from flask import current_app as app
    # This only works while inside an application context but you really shouldn't have any
    # reason to access it outside this method without being inside an application context.
    # When set_path is enabled, SERVER_NAME and APPLICATION_ROOT are set according to BaseURL
    # so URLs can be generated without an app context, e.g. in the snms shell

    if _app_ctx_stack.top:
        Logger.get('flask').warn('make_app({}) called within app context, using existing app:\n{}'.format(
            set_path, '\n'.join(traceback.format_stack())))
        return _app_ctx_stack.top.app
    app = SnmsFlask('snms', static_folder=None, template_folder='templates')
    app.config['TESTING'] = testing
    app.config['SNMS'] = load_config(only_defaults=testing, override=config_override)
    configure_app(app, set_path)

    with app.app_context():
        configure_db(app)
        configure_tsdb(app)
        celery.init_app(app)
        options.init_app(app)
        setup_request_stats(app)
        add_blueprints(app)
        Logger.init_app(app)
        configure_mqtt(app)
        signals.app_created.send(app)

        from flask_cors import CORS
        CORS(app, resources=r'/*', allow_headers='*')
    return app