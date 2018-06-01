# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from __future__ import unicode_literals

from flask import Blueprint
from flask_restful import Api

from snms.modules.companies.controllers import CompaniesCollectionResource, \
    CompaniesResource, CompanyUsersCollectionResource
from snms.modules.companies.dashboard_controller import CompanyStatsResource, \
    DashboardResource, EventLogResource

_bp = Blueprint('companies', __name__)
_api = Api(_bp)

_api.add_resource(CompaniesCollectionResource, '/companies')
_api.add_resource(CompaniesResource, '/companies/<string:company_id>')
_api.add_resource(CompanyStatsResource, '/companies/<string:company_id>/stats')
_api.add_resource(DashboardResource, '/companies/<string:company_id>/dashboard')
_api.add_resource(EventLogResource, '/companies/<string:company_id>/event_logs')

# Company Users Blueprint
_cu_bp = Blueprint('company_users', __name__)
_cu_api = Api(_cu_bp)
_cu_api.add_resource(CompanyUsersCollectionResource, '/companies/<string:company_id>/users')
