# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from __future__ import unicode_literals

from blinker import Namespace

_signals = Namespace()

registered = _signals.signal('registered', """
Called once a user registers. The
*sender* is the new user object.  The kwarg `from_moderation` indicates whether
the user went through a moderation process (this also includes users created
by an administrator manually) or was created immediately on registration;
the identity associated with the registration is passed in the `identity` kwarg.
""")