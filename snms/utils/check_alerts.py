# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Check for triggered alerts for a sensor"""
from snms.tasks import process_alert, inactivity_alerts_check


def process_sensor_alerts(sensor, data, **kwargs):
    if 'backup_alert' in list(kwargs):
        inactivity_alerts_check.delay(sensor_id=sensor.id, **kwargs)
    else:
        process_alert.delay(sensor.id, data, **kwargs)
