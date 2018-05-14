# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from snms.core.sms.backends.base import BaseSmsBackend
import requests
from snms.core.options import options
from snms.core.logger import Logger
from snms.const import SETTING_SMS_API_KEY, SETTING_SMS_FROM


_LOGGER = Logger.get()

API_URL = "https://api.textlocal.in/send/?"


class SmsBackend(BaseSmsBackend):

    def send_messages(self, messages):
        apiKey = options.option[SETTING_SMS_API_KEY]
        sender = options.option[SETTING_SMS_FROM] or 'SWARMS'
        for message in messages:
            numbers = message['to']
            rs = requests.get(API_URL, {
                'apikey': apiKey,
                'numbers': numbers,
                'message' : message['body'],
                'sender': sender,
                'test': True
            })
            _LOGGER.debug(rs.text)
