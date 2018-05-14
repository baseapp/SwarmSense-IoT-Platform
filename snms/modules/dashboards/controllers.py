# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Resource controller for dashboard and widgets"""
from functools import wraps
from flask_restful import Resource
from flask import request, g

from snms.core.db import db
from snms.modules.companies import Company, user_company_acl_role
from snms.modules.dashboards import Dashboard, Widget
from snms.modules.dashboards.schema import DashboardSchema, WidgetSchema
from snms.utils import get_filters
from snms.common.auth import login_required
from snms.utils.crypto import generate_uid


def dashboard_required(f):
    """
    Decorator to check is user has access to a company or not
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
        role = user_company_acl_role(user.id, company.id)
        if user.is_super_admin() or role:
            g.company = company
            if 'dashboard_id' in list(kwargs.keys()):
                dashboard_id = kwargs['dashboard_id']
                dashboard = Dashboard.query.filter(Dashboard.id == dashboard_id)\
                    .filter(Dashboard.company_id == company.id)\
                    .filter(~Dashboard.deleted).first()
                if dashboard is None:
                    return {'message': 'Dashboard not found', 'code': 404}, 404
            return f(*args, **kwargs)
        return {"message": "No Access", "code": 403}, 403
    return decorated_function


class DashboardListResource(Resource):
    """Resource class for dashboards"""
    method_decorators = [dashboard_required, login_required]

    def get(self, company_id):
        """Get all dashboards"""
        order_by, order_type, offset, limit, filter = get_filters(in_request=request)
        company = g.company
        if order_by not in ['id', 'name', 'updated_at', 'created_at']:
            order_by = 'id'
        dashboards = Dashboard.query\
            .filter(Dashboard.company_id == company.id)\
            .filter(Dashboard.deleted == False)
        if 'sensor_type' in filter.keys():
            dashboards = dashboards.filter(Dashboard.sensor_type == filter['sensor_type'])
        if 'dashboard_type' in filter.keys():
            dashboards = dashboards.filter(Dashboard.sensor_type == filter['dashboard_type'])

        dashboards = dashboards.order_by(db.text(order_by + " " + order_type))
        result_dashboards = []
        for dashboard in dashboards[offset:offset + limit]:
            data = DashboardSchema().dump(dashboard)[0]
            result_dashboards.append(data)
        return {"data": result_dashboards, "total": dashboards.count()}

    def post(self, company_id):
        """Add new dashboard"""
        company = g.company
        data, errors = DashboardSchema().load(request.get_json())
        if errors:
            return errors, 422
        dashboard = Dashboard(**data)
        dashboard.id = generate_uid()
        dashboard.company_id = company.id
        db.session.add(dashboard)
        db.session.commit()
        return DashboardSchema().dump(dashboard)[0], 201


class DashboardResource(Resource):
    """Resource class for dashboard"""
    method_decorators = [dashboard_required, login_required]

    def get(self, company_id, dashboard_id):
        dashboard = Dashboard.query.filter(Dashboard.id == dashboard_id)\
            .filter(~Dashboard.deleted).first()
        return DashboardSchema().dump(dashboard)[0]

    def put(self, company_id, dashboard_id):
        data, errors = DashboardSchema().load(request.get_json())
        if errors:
            return errors, 422
        Dashboard.query.filter(Dashboard.id == dashboard_id).update(data)
        db.session.commit()
        return DashboardSchema().dump(Dashboard.query.get(dashboard_id))[0]

    def delete(self, company_id, dashboard_id):
        dashboard = Dashboard.query.filter(Dashboard.id == dashboard_id)\
            .filter(~Dashboard.deleted).first()
        dashboard.deleted = True
        db.session.add(dashboard)
        db.session.commit()
        return {}, 204


class WidgetListResource(Resource):
    """Widget list resource"""
    method_decorators = [dashboard_required, login_required]

    def get(self, company_id, dashboard_id):
        """Get all the widgets for a dashboard"""
        order_by, order_type, offset, limit, filter = get_filters(in_request=request)
        widgets = Widget.query\
            .filter(Widget.dashboard_id == dashboard_id)\
            .order_by(db.text(order_by + " " + order_type))\
            .all()
        return {'data': WidgetSchema(many=True).dump(widgets)[0], 'total': len(widgets)}

    def post(self, company_id, dashboard_id):
        """Add a new widget to the dashboard"""
        data, errors = WidgetSchema().load(request.get_json())
        if errors:
            return errors, 422
        widget = Widget(**data)
        widget.id = generate_uid()
        widget.dashboard_id = dashboard_id
        db.session.add(widget)
        db.session.commit()
        return WidgetSchema().dump(widget)[0], 201


class WidgetResource(Resource):
    """Widget resource"""
    method_decorators = [dashboard_required, login_required]

    def get(self, company_id, dashboard_id, widget_id):
        """Get widget"""
        widget = Widget.query\
            .filter(Widget.dashboard_id == dashboard_id)\
            .filter(Widget.id == widget_id)\
            .first()
        return WidgetSchema().dump(widget)[0]

    def put(self, company_id, dashboard_id, widget_id):
        """Update a widget"""
        data, errors = DashboardSchema().load(request.get_json())
        if errors:
            return errors, 422
        Widget.query.filter(Widget.dashboard_id == dashboard_id).filter(Widget.id == widget_id).update(data)
        db.session.commit()
        return WidgetSchema().dump(Widget.query.get(widget_id))[0]

    def delete(self, company_id, dashboard_id, widget_id):
        """Delete a widget"""
        widget = Widget.query\
            .filter(Widget.dashboard_id == dashboard_id)\
            .filter(Widget.id == widget_id)\
            .first()
        db.session.delete(widget)
        db.session.commit()
        return {}