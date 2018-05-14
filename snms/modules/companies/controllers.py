# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Company Resources"""
from functools import wraps
import datetime

from flask import render_template_string
from flask_restful import Api, Resource, reqparse
from flask import g, jsonify, Blueprint, request

from snms.models import add_event_log
from snms.database import tsdb
from snms.core.db import db
from snms.utils import get_filters
from snms.core.logger import Logger
from snms.modules.companies import Company, CompanyUserAssociation, UserInvite, company_user_acl
from snms.modules.sensors import Sensor, get_all_types
from snms.modules.networks import Network
from snms.modules.alerts import Alert
from snms.modules.users import User
from snms.common.auth import login_required
from snms.utils.crypto import generate_uid, generate_key
from snms.tasks import send_email
from snms.const import ALERT_HISTORY_SERIES, DAILY_ANALYTICS_SERIES, \
    EVENT_LOG_SERIES, C_ROLE_DEFAULT, ROLE_ADMIN, SETTING_TEMPLATE_INVITE_EMAIL
from snms.core.options import options


_LOGGER = Logger.get()


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


class CompaniesCollectionResource(Resource):
    """Company Collection resource."""
    method_decorators = [login_required]

    def get(self):
        """
        Get all companies.
        :rtype: response object
        """
        # TODO: get user's companies
        order_by, order_type, offset, limit, filter = get_filters(in_request=request)
        user = g.get('user', None)
        companies = []
        count = 0
        if user.is_super_admin():
            companies = Company.query.filter(Company.deleted == False).order_by(db.text("{}.{} {}".format(Company.__tablename__, order_by, order_type)))
            count = companies.count()
            return {
                "data": [{
                    'id': company.uid,
                    'name': company.name,
                    'key': company.key,
                    'owner_name': company.owner.name,
                    'role': ROLE_ADMIN
                    } for company in companies[offset:offset+limit]],
                "total": count
            }
        else:
            # companies = Company.query.join(Company.users).filter(CompanyUserAssociation.user_id == user.id).filter(Company.deleted == False)
            user_companies = db.session.query(Company, CompanyUserAssociation)\
                .join(CompanyUserAssociation.company)\
                .filter(CompanyUserAssociation.user_id == user.id)\
                .filter(Company.deleted == False)
            count = user_companies.count()
            # TODO: Show key according to access level
            return {
                "data": [{
                    'id': company.uid,
                    'name': company.name,
                    'key': company.key if ass.role != C_ROLE_DEFAULT else None,
                    'owner_name': company.owner.name,
                    'role': ass.role
                    } for company, ass in user_companies[offset:offset+limit]],
                "total": count
            }

    def post(self):
        """Add a new company to the user"""
        # TODO: Error Checks.
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=True, help="Name is required")
        args = parser.parse_args()
        user = g.get('user', None)
        company = Company(uid=generate_uid(), key=generate_key(), name=args['name'], owner_id=user.id)
        user_company = CompanyUserAssociation(role=ROLE_ADMIN)
        user_company.user = user
        company.users.append(user_company)
        db.session.add(company)
        db.session.commit()
        add_event_log(company_id=company.uid, user_id=user.uid, log="Company Created: {}".format(company.name))
        return {"id": company.uid, 'key': company.key}, 200


class CompaniesResource(Resource):
    """Company Resource"""
    method_decorators = [company_required, login_required]

    def get(self, company_id, company=None):
        """Get a company details"""
        company = Company.query.filter(Company.uid == company_id).filter(Company.deleted == False).first()
        if company is None:
            return {'message': 'Company not found', 'code': 404}, 404
        role = g.company_user_role
        # TODO: Send key according to access level
        return {"name": company.name, "id": company.uid, 'key': company.key if role and role != C_ROLE_DEFAULT else None, 'role': role}
        # return {"message": "No Access", "code": 403}, 403

    def put(self, company_id):
        """Update a company."""
        company = Company.query.filter(Company.uid == company_id).filter(Company.deleted == False).first()
        if company is None:
            return {'message': 'Company not found', 'code': 404}, 404
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=True, help="Name is required")
        args = parser.parse_args()
        company.name = args['name']
        db.session.commit()
        return {"message": "Company Updated"}, 200

    def delete(self, company_id):
        """Delete a company from database"""
        company = Company.query.filter(Company.uid == company_id).filter(Company.deleted == False).first()
        if company is None:
            return {'message': 'Company not found', 'code': 404}, 404
        user = g.user
        # TODO: Check user access for the company OR only owner can delete a company
        if user.is_super_admin() or user.id == company.owner_id:
            # company.users = []
            company.deleted = True
            db.session.add(company)
            db.session.commit()
            # TODO: Soft delete Sensors and Alerts.
            add_event_log(company_id=company_id, user_id=user.uid, log="Company Deleted: {}".format(company.name))
            return {"message": "Company deleted"}, 200
        return {"message": "No Access", "code": 403}, 403


class CompanyUsersCollectionResource(Resource):
    """Company Users Collection Resource."""
    method_decorators = [company_required, login_required]

    def get(self, company_id):
        """Get All users of a company"""
        order_by, order_type, offset, limit, filter = get_filters(in_request=request)
        company = Company.query.filter(Company.uid == company_id).filter(Company.deleted == False).first()
        company_users = db.session.query(User, CompanyUserAssociation)\
            .join(CompanyUserAssociation.user)\
            .filter(CompanyUserAssociation.company_id == company.id)\
            .filter(User.deleted == False)
        if 'email' in filter.keys():
            company_users = company_users.filter(User.email == filter['email'])
        count = company_users.count()
        # TODO: Show key according to access level
        return {
            "data": [{
                'id': user.uid,
                 'name': user.name,
                'email': user.email,
                'role': ass.role
                } for user, ass in company_users[offset:offset+limit]],
            "total": count
        }

    def post(self, company_id):
        """Add new users to company"""
        data = request.json
        company = Company.query.filter(Company.uid == company_id).filter(Company.deleted == False).first()
        try:
            email = data["email"]
            role = data["role"]
            user = User.query.filter(User.email == email).filter(User.deleted == False).first()
            if user is None:
                # TODO: invite user for company email template.
                invite = UserInvite(company_id=company.id, email=email, role=role)
                db.session.add(invite)
                db.session.commit()
                message = render_template_string(
                    options.option[SETTING_TEMPLATE_INVITE_EMAIL],
                    email=email,
                    company_name=company.name
                )
                send_email.delay("Invitation", message, [email])
            else:
                ass = CompanyUserAssociation(user_id=user.id, role=role)
                company.users.append(ass)
            db.session.add(company)
            db.session.commit()
            return {}
        except Exception as e:
            _LOGGER.error(e)
            return {}, 500

    def delete(self, company_id):
        """Remove users for company"""
        data = request.json
        company = Company.query.filter(Company.uid == company_id).filter(Company.deleted == False).first()
        try:
            for email in data["user_emails"]:
                user = User.query.filter(User.email == email).filter(User.deleted == False).first()
                if user is None or user.id == company.owner_id:
                    # TODO: Log error.
                    pass
                else:
                    CompanyUserAssociation.query.filter(CompanyUserAssociation.user_id == user.id).filter(CompanyUserAssociation.company_id == company.id).delete()
                    # company.users.remove(user)
                UserInvite.query.filter(email == email).delete()
            db.session.add(company)
            db.session.commit()
            return {}
        except Exception as e:
            _LOGGER.error(e)
            return {}, 500


class CompanyStatsResource(Resource):
    method_decorators = [company_required, login_required]

    def get(self, company_id):
        """Get Company status"""

        now = datetime.datetime.utcnow()
        last_hr = now - datetime.timedelta(hours=1)
        _LOGGER.info(last_hr)
        company = Company.query.filter(Company.uid == company_id).filter(Company.deleted == False).first()
        total_sensors = Sensor.query.filter(Sensor.company_id == company.id).filter(Sensor.deleted == False).count()
        total_sensors_down = Sensor.query.filter(Sensor.company_id == company.id).filter(Sensor.deleted == False).filter(Sensor.is_down == True).count()
        alert_logs = tsdb.get_points_raw(
            ALERT_HISTORY_SERIES,
            tags={'company_id': company_id},
            order_by='time desc',
            limit=10,
            offset=0,
            duration='1h',
            count_only=True
        )

        all_types = get_all_types()
        all_measurements = list(all_types.keys())
        message_logs = tsdb.get_points_raw(
            all_measurements,
            tags={'company_id': company.id},
            order_by='time desc',
            limit=10,
            offset=0,
            duration='1h',
            count_only=True
        )
        new_sensors = Sensor.query.filter(Sensor.company_id == company.id).filter(Sensor.deleted == False).filter(Sensor.created_at >= last_hr).count()
        daily_hits = tsdb.get_points_raw(
            DAILY_ANALYTICS_SERIES,
            tags={'company_id': company_id},
            order_by='time desc',
            limit=100,
            offset=0
        )

        return {
            "devices_online": total_sensors - total_sensors_down,
            "alerts_generated": alert_logs['total'],
            "message_received": message_logs['total'],
            "new_devices": new_sensors,
            "daily_hits": daily_hits
        }


class EventLogResource(Resource):
    """Event Log History Resources"""

    method_decorators = [company_required, login_required]

    def get(self, company_id):
        """Get alert trigger history"""
        order_by, order_type, offset, limit, filter = get_filters(in_request=request)

        company = Company.query.filter(Company.uid == company_id).filter(Company.deleted == False).first()
        tags = {"company_id": company.uid}
        if "sensor_id" in filter.keys():
            tags["sensor_id"] = filter["sensor_id"]
        try:
            return tsdb.get_points_raw(EVENT_LOG_SERIES, tags=tags, order_by='time desc', limit=limit, offset=offset)
        except Exception as e:
            _LOGGER.error(e)
            return {'error': 'Server error'}, 500


class DashboardResource(Resource):

    method_decorators = [company_required, login_required]

    def get(self, company_id):
        company = Company.query.filter(Company.uid == company_id).filter(Company.deleted == False).first()
        total_sensors = Sensor.query.filter(Sensor.company_id == company.id).filter(Sensor.deleted == False).count()
        total_sensors_down = Sensor.query.filter(Sensor.company_id == company.id).filter(Sensor.deleted == False).filter(Sensor.is_down == True).count()
        total_network = Network.query.filter(Network.company_id == company.id).filter(Network.deleted == False).count()
        total_alerts = Alert.query.filter(Alert.company_id == company.id).filter(Alert.deleted == False).count()
        event_logs = tsdb.get_points_raw(EVENT_LOG_SERIES, tags={'company_id': company_id}, order_by='time desc', limit=10, offset=0)

        return {
            "total_sensors": total_sensors,
            "total_sensors_up": total_sensors - total_sensors_down,
            "total_sensors_down": total_sensors_down,
            "total_network": total_network,
            "total_alerts": total_alerts,
            "event_logs": event_logs['data']
        }