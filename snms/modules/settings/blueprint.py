# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from __future__ import unicode_literals

from flask import Blueprint
from flask_restful import Api

from snms.modules.settings.controllers import SettingListResource, SettingResource, AllSettingsResource

_bp = Blueprint('settings', __name__)
_api = Api(_bp)

_api.add_resource(SettingListResource, '/settings')
_api.add_resource(SettingResource, '/settings/<string:setting_id>')
_api.add_resource(AllSettingsResource, '/settings_all')