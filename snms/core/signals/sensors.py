# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from blinker import Namespace


_signals = Namespace()


sensor_pre_create = _signals.signal('sensor-before-create', """
Called before a sensor is created.
""")

sensor_created = _signals.signal('sensor_created', """
Called when a sensor is created
""")
