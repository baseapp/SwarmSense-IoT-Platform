# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Middleware for sensor access"""

from functools import wraps
from werkzeug.exceptions import Unauthorized, Forbidden, NotFound
from flask import g, request
from snms.common.auth import DecodeError, parse_token, ExpiredSignature
from snms.modules.users import User
from snms.modules.companies import Company, user_company_acl_role
from snms.modules.sensors import Sensor
from snms.const import ROLE_ADMIN, ROLE_READ, ROLE_WRITE


def access_control(f):
    """
    Decorator to check for sensor access
    :param f:
    :return:
    """

    @wraps(f)
    def decorated_function(*args, **kwargs):
        sensor_key = request.headers.get('X-Sensor-Key')
        if not sensor_key:
            sensor_key = request.args.get('sensor_key', None)

        company_key = request.headers.get('X-Company-Key')
        if not company_key:
            company_key = request.args.get('company_key', None)

        auth_header = request.headers.get('Authorization')

        company_ids = []
        super_admin = False
        role = None
        if auth_header:
            try:
                payload = parse_token(request)
            except DecodeError:
                raise Unauthorized('Token is invalid')
            except ExpiredSignature:
                raise Unauthorized('Token has expired')
            if payload is None:
                raise Unauthorized('Token is invalid')
            g.user_id = payload['sub']
            user_query = User.query.filter(User.id == g.user_id).filter(User.deleted == False)
            user = user_query.first()
            if user is None:
                raise Forbidden('Unauthorized access')
            g.user = user
            # TODO: Update rest of the code.
            if user.is_super_admin():
                super_admin = True
                role = ROLE_ADMIN
                g.company_user_role = role

        if 'sensor_id' in kwargs.keys():
            sensor_uid = kwargs['sensor_id']
            sensor = Sensor.query.filter(Sensor.uid == sensor_uid).filter(Sensor.deleted == False).first()
            if sensor is None:
                raise NotFound("Sensor not found")
            g.sensor = sensor
            if sensor.key == sensor_key or sensor.company.key == company_key or super_admin:
                return f(*args, **kwargs)
            if auth_header and g.user:
                role = user_company_acl_role(g.user.id, sensor.company_id)
                if role:
                    g.company_user_role = role
                    return f(*args, **kwargs)
            raise Forbidden('Unauthorized access')

        if 'sensor_hid' in kwargs.keys() and 'company_id' in kwargs.keys():
            sensor_hid = kwargs['sensor_hid']
            company_id = kwargs['company_id']
            company = Company.query.filter(Company.uid == company_id).filter(Company.deleted == False).first()

            sensor = Sensor.query.filter(Sensor.hid == sensor_hid).filter(Sensor.company_id == company.id).filter(Sensor.deleted == False).first()
            if sensor is None:
                raise NotFound("Sensor not found")
            g.sensor = sensor
            if sensor.key == sensor_key or company.key == company_key or super_admin:
                return f(*args, **kwargs)
            if auth_header and g.user:
                role = user_company_acl_role(g.user.id, sensor.company_id)
                if role:
                    g.company_user_role = role
                    return f(*args, **kwargs)
            raise Forbidden('Unauthorized access')

        if 'company_id' in kwargs.keys():
            company_id = kwargs['company_id']
            company = Company.query.filter(Company.uid == company_id).filter(Company.deleted == False).first()
            if company is None:
                raise NotFound("Company Not Found")
            if company.key == company_key or super_admin:
                g.company_user_role = ROLE_WRITE
                if super_admin:
                    g.company_user_role = ROLE_ADMIN
                return f(*args, **kwargs)
            if g.get('user', None):
                role = user_company_acl_role(g.user.id, company.id)
                if role:
                    g.company_user_role = role
                    return f(*args, **kwargs)
            raise Forbidden('Unauthorized access')

        raise Forbidden('Unauthorized access')

    return decorated_function

