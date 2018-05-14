# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from flask import g, request
from snms.database import tsdb
from snms.const import EVENT_LOG_SERIES


def add_event_log(company_id=None, user_id=None, sensor_id=None, alert_id=None, network_id=None, event_id=None, log=None):
    """Add event logs"""
    tags = {}
    fields = {'log': log}
    if company_id is not None:
        tags['company_id'] = company_id
    if user_id:
        tags['user_id'] = user_id
    else:
        try:
            user = g.user
            if user:
                tags['user_id'] = user.uid
                # fields['user'] = user.name
        except Exception as e:
            pass
    if alert_id is not None:
        tags['alert_id'] = alert_id
    if event_id is not None:
        tags['event_id'] = event_id
    if network_id is not None:
        tags['network_id'] = network_id
    if sensor_id is not None:
        tags['sensor_id'] = sensor_id
    fields['ip_addr'] = request.remote_addr

    tsdb.add_series(EVENT_LOG_SERIES, tags=tags, fields=fields)