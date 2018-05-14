# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from __future__ import unicode_literals

from flask import Blueprint
from flask_restful import Api

from snms.modules.auth.controllers import ForgotPassword, SignupResource, \
    LoginResource, ResetPassword, EmailVerifyResource, ResendVerificationMail

_bp = Blueprint('auth', __name__)
_api = Api(_bp)

_api.add_resource(SignupResource, '/signup')
_api.add_resource(LoginResource, '/login')
_api.add_resource(ForgotPassword, '/forgot-password')
_api.add_resource(ResetPassword, '/reset-password')
_api.add_resource(EmailVerifyResource, '/verify')
_api.add_resource(ResendVerificationMail, '/resend-verification')