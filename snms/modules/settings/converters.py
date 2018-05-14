# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Settings converter"""
from snms.core.logger import Logger

_LOGGER = Logger.get()


def _converter_int(value):
    return int(value)


def _converter_boolean(value):
    if value:
        if value == '0':
            return False
        else:
            return True
    return False


def _converter_text(value):
    return value


def convert_settings(settings, default_settings):
    for d in default_settings:
        try:
            converter_function = "_converter_{}".format(d['type'])
            settings[d['key']] = globals()[converter_function](settings[d['key']])
        except KeyError:
            settings[d['key']] = d['value']
        except Exception as e:
            _LOGGER.error(e)
    return settings