# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from snms.const import TSDB_CLIENT
from .tsdb import TSDB, TSDBClient

tsdb = TSDBClient.factory(TSDB_CLIENT)
