# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Base class for SMS Clients"""

API_URL = ""

class BaseSmsBackend:
    """
    Base class for SMS backend implementations.
    """
    def __init__(self, **kwargs):
        pass

    def open(self):
        pass

    def close(self):
        pass

    def __enter__(self):
        try:
            self.open()
        except Exception:
            self.close()
            raise
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self.close()

    def send_messages(self, messages):

        raise NotImplementedError('subclass of BaseSmsBackend must override send_messages() method')