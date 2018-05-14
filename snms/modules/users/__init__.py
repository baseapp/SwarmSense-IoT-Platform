# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from __future__ import unicode_literals

from snms.core import signals
from snms.core.logger import Logger
from snms.modules.users.models.users import User
from snms.modules.users.models.settings import UserMetaData

__all__ = ('User', 'UserMetaData')

logger = Logger.get('users')

@signals.users.registered.connect
def _registered(user, identity, from_moderation, **kwargs):
    logger.info("User registered")