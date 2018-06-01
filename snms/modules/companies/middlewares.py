# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Company Resources Middleware"""
from functools import wraps
from flask import g, request

from snms.core.logger import Logger
from snms.modules.companies import Company, CompanyUserAssociation, company_user_acl

from snms.const import C_ROLE_DEFAULT, ROLE_ADMIN


def user_company_acl_role(user_id, company_id):
    """Check if a user can access company"""
    company_user = CompanyUserAssociation.query.filter(CompanyUserAssociation.user_id == user_id)\
            .filter(CompanyUserAssociation.company_id == company_id).first()
    if company_user:
        role = company_user.role
        if not role:
            role = C_ROLE_DEFAULT
        bp = request.blueprint
        method = request.method
        if method.upper() in company_user_acl[role]['methods'] and bp in company_user_acl[role]['blueprints']:
            return role
        else:
            return None
    else:
        return None


def company_required(f):
    """
    Decorater to check is user has access to a company or not
    :param f:
    :return:
    """

    @wraps(f)
    def decorated_function(*args, **kwargs):
        company_id = kwargs['company_id']
        company = Company.query.filter(Company.uid == company_id).filter(Company.deleted == False).first()
        if company is None:
            return {'message': 'Company not found', 'code': 404}, 404
        user = g.user
        if user.is_super_admin():
            g.company_user_role = ROLE_ADMIN
            return f(*args, **kwargs)
        role = user_company_acl_role(user.id, company.id)
        print(role)
        if role:
            g.company_user_role = role
            return f(*args, **kwargs)
        return {"message": "No Access", "code": 403}, 403
    return decorated_function