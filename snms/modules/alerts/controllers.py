# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Alert Resources"""
from functools import wraps
from flask import g, request
from flask_restful import Resource, reqparse
from werkzeug.exceptions import Forbidden, NotFound

from snms.database import tsdb
from snms.core.db import db
from snms.models import add_event_log
from snms.modules.companies import Company #, company_user_table
from snms.modules.sensors import Sensor
from snms.core.logger import Logger
from snms.modules.alerts import Alert, AlertSchema
from snms.common.auth import login_required
from snms.modules.companies import company_required, user_company_acl_role
from snms.utils import get_filters
from snms.utils.crypto import generate_uid
from snms.const import ALERT_HISTORY_SERIES, EVENT_LOG_SERIES

_LOGGER = Logger.get()


def user_alert_access(f):
    """
    Decorator to check is user has the alert access
    :param f:
    :return:
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        alert_id = kwargs['alert_id']
        alert = Alert.query.filter(Alert.uid == alert_id).filter(Alert.deleted == False).first()
        if alert is None:
            raise NotFound("Alert not found")
        user = g.user
        role = user_company_acl_role(user.id, alert.company_id)
        if user.is_super_admin() or role:
            return f(*args, **kwargs)
        raise Forbidden()
    return decorated_function


class AlertsCollectionResource(Resource):
    """Alerts Collection Resource"""
    method_decorators = [company_required, login_required]

    def get(self, company_id):
        """Get all the alerts for the company"""
        order_by, order_type, offset, limit, filter = get_filters(in_request=request)
        company = Company.query.filter(Company.uid == company_id).filter(Company.deleted == False).first()
        alerts = Alert.query.filter(Alert.company_id == company.id).filter(Alert.deleted == False)
        if "action_type" in filter.keys():
            alerts = alerts.filter(Alert.action_type == filter['action_type'])
        if "actuator_type" in filter.keys():
            alerts = alerts.filter(Alert.actuator_type == filter['actuator_type'])
        if "sensor_type" in filter.keys():
            alerts = alerts.filter(Alert.sensor_type == filter['sensor_type'])
        if order_by in ['id', 'type', 'sensor_type', 'name', 'field', 'created_at']:
            alerts = alerts.order_by(db.text(order_by + " " + order_type))
        result_alerts = []
        for alert in alerts[offset:offset + limit]:
            data, errors = AlertSchema().dump(alert)
            result_alerts.append(data)
        return {"data": result_alerts, "total": alerts.count()}

    def post(self, company_id):
        """Add a new Alert to the company"""
        data, errors = AlertSchema().load(request.get_json())
        _LOGGER.debug(data)
        if errors:
            return errors, 422
        company = Company.query.filter(Company.uid == company_id).filter(Company.deleted == False).first()
        # TODO: Implement recipients list check
        data["uid"] = generate_uid()
        alert = Alert(**data)
        db.session.add(alert)
        company.alerts.append(alert)
        db.session.commit()
        add_event_log(company_id=company_id, alert_id=alert.uid, log='Alert added: {}'.format(alert.name))
        # TODO: Error Handling
        return {"id": alert.uid}, 201


class AlertResource(Resource):
    """Alert Resource"""
    method_decorators = [user_alert_access, login_required]

    def get(self, alert_id, company_id=None):
        """Get alert detail"""
        alert = Alert.query.filter(Alert.uid == alert_id).filter(Alert.deleted == False).first()
        data, errors = AlertSchema().dump(alert)
        return data

    def put(self, alert_id, company_id=None):
        """Update Alert details"""
        data, errors = AlertSchema().load(request.get_json())
        _LOGGER.debug(data)
        if errors:
            return errors, 422
        try:
            alert = Alert.query.filter(Alert.uid == alert_id).update(data)
            db.session.commit()
            return {'status': alert}
        except Exception as e:
            _LOGGER.error(e)
            return {'message': 'Internal Server Error', 'code': 500}, 500

    def delete(self, alert_id, company_id=None):
        """Delete a alert from database"""
        try:
            alert = Alert.query.filter(Alert.uid == alert_id).filter(Alert.deleted == False).first()
            alert.deleted = True
            db.session.add(alert)
            db.session.commit()
            add_event_log(company_id=company_id, alert_id=alert.uid, log='Alert deleted: {}'.format(alert.name))
            return {}, 204
        except Exception as e:
            db.session.rollback()
            _LOGGER.error(e)
            return {"error": "Server Error"}, 500


class AlertHistoryResource(Resource):
    """Alert History Resources"""

    method_decorators = [company_required, login_required]

    def get(self, company_id):
        """Get alert trigger history"""
        order_by, order_type, offset, limit, filter = get_filters(in_request=request)

        company = Company.query.filter(Company.uid == company_id).filter(Company.deleted == False).first()
        tags = {"company_id": company.uid}
        if "sensor_id" in filter.keys():
            tags["sensor_id"] = filter["sensor_id"]
        if "alert_id" in filter.keys():
            alert = Alert.query.filter(Alert.uid == filter["alert_id"]).filter(Alert.deleted == False).first()
            if alert:
                tags["alert_id"] = alert.uid
        try:
            return tsdb.get_points_raw(ALERT_HISTORY_SERIES, tags=tags, order_by='time desc', limit=limit, offset=offset)
        except Exception as e:
            _LOGGER.error(e)
            return {'error': 'Server error'}, 500
