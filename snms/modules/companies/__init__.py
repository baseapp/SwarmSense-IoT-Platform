# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from __future__ import unicode_literals

from snms.modules.companies.models.companies import Company, UserInvite, CompanyUserAssociation
from snms.const import ROLE_READ, ROLE_ADMIN, ROLE_WRITE

company_user_acl = {
    ROLE_READ: {
        'methods': ['GET'],
        'blueprints': ['companies', 'sensors', 'alerts', 'events', 'networks', 'dashboards']
    },
    ROLE_WRITE: {
        'methods': ['GET', 'POST', 'PUT', 'DELETE'],
        'blueprints': ['companies', 'sensors', 'alerts', 'events', 'networks', 'dashboards']
    },
    ROLE_ADMIN: {
        'methods': ['GET', 'POST', 'PUT', 'DELETE'],
        'blueprints': ['companies', 'sensors', 'alerts', 'events', 'networks', 'company_users', 'dashboards']
    }
}

from snms.modules.companies.controllers import user_company_acl_role, company_required

__all__ = ('Company', 'UserInvite', 'CompanyUserAssociation', 'company_user_acl', 'user_company_acl_role', 'company_required')
