# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from __future__ import unicode_literals

from flask import Blueprint
from flask_restful import Api

from snms.modules.users.controllers import UserListResource, \
    UserResource, UserAccessResource, CurrentUserResource, UserMetaResource

_bp = Blueprint('users', __name__)
_api = Api(_bp)

_api.add_resource(UserListResource, '/users')
_api.add_resource(UserResource, '/users/<string:user_id>')
_api.add_resource(UserAccessResource, '/users/<string:user_id>/token')
_api.add_resource(CurrentUserResource, '/me')
_api.add_resource(UserMetaResource, '/me/meta_data')