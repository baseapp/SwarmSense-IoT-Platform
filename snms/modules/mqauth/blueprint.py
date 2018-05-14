# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from __future__ import unicode_literals

from flask import Blueprint
from flask_restful import Api

from snms.modules.mqauth.controllers import UserPathResource, TopicPathResource, VhostPathResource, ResourcePathResource

_bp = Blueprint('mq-auth', __name__)
_api = Api(_bp)

_api.add_resource(UserPathResource, '/mq-auth/user')
_api.add_resource(VhostPathResource, '/mq-auth/vhost')
_api.add_resource(ResourcePathResource, '/mq-auth/resource')
_api.add_resource(TopicPathResource, '/mq-auth/topic')