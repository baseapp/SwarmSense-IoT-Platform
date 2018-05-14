# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""
Tool for sending text messages on mobile.
"""
from snms.core.logger import Logger
from twilio.rest import Client

from snms.utils.module_loading import import_string
from snms.core.config import config
from snms.core.options import options
from snms.const import SETTING_SMS_BACKEND

_LOGGER = Logger.get()


class SmsMessage:

    def __init__(self, to, body, user=None, connection=None):
        if to:
            if isinstance(to, str):
                raise TypeError('"to" argument must be a list or tuple')
            self.to = list(to)
        else:
            self.to = []
        self.body = body
        self.connection = connection

    def send(self):
        """Send the sms message."""
        if len(self.to) == 0:
            # Don't bother creating the network connection if there's nobody to
            # send to.
            return 0
        return get_connection().send_messages([self])


def get_connection(backend=None):
    """Load an sms backend and return an instance of it.

    If backend is None (default), use settings.SMS_BACKEND.

    Both fail_silently and other keyword arguments are used in the
    constructor of the backend.
    """
    if backend is None:
        if 'SmsBackend' in options.option[SETTING_SMS_BACKEND]:
            backend = options.option[SETTING_SMS_BACKEND]
        else:
            backend = 'snms.core.sms.backends.{}.SmsBackend'.format(options.option[SETTING_SMS_BACKEND])
    klass = import_string(backend)
    return klass()


def send_sms(to, body, _from=None):
    """
    Send Text message to mobile.

    :param to:
    :param body: Message
    :param _from:
    :return:
    """
    return get_connection().send_messages([{
        'to': to,
        'body': body
    }])

