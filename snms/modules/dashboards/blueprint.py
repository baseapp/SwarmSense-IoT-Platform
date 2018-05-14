# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from __future__ import unicode_literals

from flask import Blueprint
from flask_restful import Api

from snms.modules.dashboards.controllers import DashboardListResource, \
    DashboardResource, WidgetListResource, WidgetResource

_bp = Blueprint('dashboards', __name__)
_api = Api(_bp)


_api.add_resource(DashboardListResource,
                  '/companies/<string:company_id>/dashboards')
_api.add_resource(DashboardResource,
                  '/companies/<string:company_id>/dashboards/<string:dashboard_id>')
_api.add_resource(WidgetListResource,
                  '/companies/<string:company_id>/dashboards/<string:dashboard_id>/widgets')
_api.add_resource(WidgetResource,
                  '/companies/<string:company_id>/dashboards/<string:dashboard_id>/widgets/<string:widget_id>')
