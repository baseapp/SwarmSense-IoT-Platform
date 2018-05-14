# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from __future__ import unicode_literals

import time

from flask import g, request_started
from sqlalchemy.engine import Engine
from sqlalchemy.event import listens_for


def request_stats_request_started():
    if g.get('request_stats_initialized'):
        return
    g.request_stats_initialized = True
    g.query_count = 0
    g.query_duration = 0
    g.req_start_ts = time.time()


def setup_request_stats(app):
    @request_started.connect_via(app)
    def _request_started(sender, **kwargs):
        request_stats_request_started()

    @listens_for(Engine, 'before_cursor_execute', named=True)
    def before_cursor_execute(context, **unused):
        if not g.get('request_stats_initialized'):
            return
        context._query_start_time = time.time()

    @listens_for(Engine, 'after_cursor_execute', named=True)
    def after_cursor_execute(context, **unused):
        if not g.get('request_stats_initialized'):
            return
        total = time.time() - context._query_start_time
        g.query_count += 1
        g.query_duration += total


def get_request_stats():
    initialized = g.get('request_stats_initialized')
    return {
        'query_count': g.query_count if initialized else 0,
        'query_duration': g.query_duration if initialized else 0,
        'req_duration': (time.time() - g.req_start_ts) if initialized else 0
    }
