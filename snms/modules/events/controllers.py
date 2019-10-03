# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Event Resources"""
from functools import wraps
from flask import g, request
from flask_restful import Resource, reqparse
from werkzeug.exceptions import Forbidden, NotFound
from datetime import datetime, timezone

from snms.database import tsdb
from snms.core.db import db
from snms.models import add_event_log
from snms.modules.companies import Company #, company_user_table
from snms.modules.sensors import Sensor
from snms.core.logger import Logger
from snms.modules.events import Event, EventSchema, get_next_runtime
from snms.common.auth import login_required
from snms.modules.companies import company_required, user_company_acl_role
from snms.utils import get_filters
from snms.utils.crypto import generate_uid
from snms.const import EVENT_HISTORY_SERIES, EVENT_LOG_SERIES

_LOGGER = Logger.get()


def user_event_access(f):
    """
    Decorator to check is user has the event access
    :param f:
    :return:
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        event_id = kwargs['event_id']
        event = Event.query.filter(Event.id == event_id).filter(Event.deleted_at == None).first()
        if event is None:
            raise NotFound("Event not found")
        user = g.user
        role = user_company_acl_role(user.id, event.company_id)
        if user.is_super_admin() or role:
            return f(*args, **kwargs)
        raise Forbidden()
    return decorated_function


class EventsCollectionResource(Resource):
    """Events Collection Resource"""
    method_decorators = [company_required, login_required]

    def get(self, company_id):
        """Get all the events for the company"""
        order_by, order_type, offset, limit, filter = get_filters(in_request=request)
        company = Company.query.filter(Company.uid == company_id).filter(Company.deleted == False).first()
        events = Event.query.filter(Event.company_id == company.id).filter(Event.deleted_at == None)
        if "actuator_type" in filter.keys():
            events = events.filter(Event.actuator_type == filter['actuator_type'])
        if order_by in ['id', 'name', 'created_at', 'next_runtime']:
            events = events.order_by(db.text(order_by + " " + order_type))
        result_events = []
        for event in events[offset:offset + limit]:
            data, errors = EventSchema().dump(event)
            result_events.append(data)
        return {"data": result_events, "total": events.count()}

    def post(self, company_id):
        """Add a new Event to the company"""
        data, errors = EventSchema().load(request.get_json())
        _LOGGER.debug(data)
        if errors:
            return errors, 422
        company = Company.query.filter(Company.uid == company_id).filter(Company.deleted == False).first()
        data["id"] = generate_uid()
        event = Event(**data)
        event.next_runtime = get_next_runtime(event.start_date, event.repeat, event.unit)
        db.session.add(event)
        company.events.append(event)
        db.session.commit()
        add_event_log(company_id=company_id, event_id=event.id, log='Event added: {}'.format(event.name))
        # TODO: Error Handling
        return {"id": event.id}, 201


class EventResource(Resource):
    """Event Resource"""
    method_decorators = [user_event_access, login_required]

    def get(self, event_id, company_id=None):
        """Get event detail"""
        event = Event.query.filter(Event.id == event_id).filter(Event.deleted_at == None).first()
        data, errors = EventSchema().dump(event)
        return data

    def put(self, event_id, company_id=None):
        """Update Event details"""
        data, errors = EventSchema().load(request.get_json())
        _LOGGER.debug(data)
        if errors:
            return errors, 422
        try:
            event = Event.query.filter(Event.id == event_id).update(data)
            event = Event.query.get(event_id)
            # db.session.commit()
            event.next_runtime = get_next_runtime(event.start_date, event.repeat, event.unit)
            db.session.add(event)
            db.session.commit()

            return {}
        except Exception as e:
            _LOGGER.error(e)
            return {'message': 'Internal Server Error', 'code': 500}, 500

    def delete(self, event_id, company_id=None):
        """Delete a event from database"""
        try:
            event = Event.query.filter(Event.id == event_id).filter(Event.deleted_at == None).first()
            event.deleted_at = datetime.utcnow()
            db.session.add(event)
            db.session.commit()
            add_event_log(company_id=company_id, event_id=event.id, log='Event deleted: {}'.format(event.name))
            return {}, 204
        except Exception as e:
            db.session.rollback()
            _LOGGER.error(e)
            return {"error": "Server Error"}, 500


class EventHistoryResource(Resource):
    """Event History Resources"""

    method_decorators = [company_required, login_required]

    def get(self, company_id):
        """Get event run history"""
        order_by, order_type, offset, limit, filter = get_filters(in_request=request)

        company = Company.query.filter(Company.uid == company_id).filter(Company.deleted == False).first()
        tags = {"company_id": company.uid}
        if "sensor_id" in filter.keys():
            tags["sensor_id"] = filter["sensor_id"]
        if "event_id" in filter.keys():
            event = Event.query.filter(Event.id == filter["event_id"]).filter(Event.deleted_at == None).first()
            if event:
                tags["event_id"] = event.id
        try:
            return tsdb.get_points_raw(EVENT_HISTORY_SERIES, tags=tags, order_by='time desc', limit=limit, offset=offset)
        except Exception as e:
            _LOGGER.error(e)
            return {'error': 'Server error'}, 500
