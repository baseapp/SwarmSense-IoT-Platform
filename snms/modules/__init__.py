# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from snms.core import signals
from snms.core.logger import Logger

_LOGGER = Logger.get(__name__)


@signals.app_created.connect
def _add_log(app, **kwargs):
    _LOGGER.info("Application Started...")