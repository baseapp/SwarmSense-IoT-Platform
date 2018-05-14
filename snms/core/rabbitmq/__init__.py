# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from snms.core.rabbitmq.fpika import Pika as FPika
from snms.core.mqtt import Mqtt

USE_RABBITMQ = True

if USE_RABBITMQ:
    publisher = FPika()
else:
    publisher = Mqtt()
