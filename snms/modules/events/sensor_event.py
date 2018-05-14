# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Sensor Event Resources"""

from functools import wraps
from flask import g, request
from flask_restful import Resource
from werkzeug.exceptions import Forbidden, NotFound

from snms.core.db import db
from snms.core.logger import Logger
from snms.modules.companies import Company # , company_user_table
from snms.modules.sensors import Sensor
from snms.modules.events import Event, EventSchema, SensorEventAssociation
from snms.common.auth import login_required
from snms.modules.sensors.controllers import user_sensor_access
from snms.const import ALERT_ACTION_TRIGGER

_LOGGER = Logger.get()


class SensorEventResource(Resource):
    """Sensor Event Resource"""
    method_decorators = [user_sensor_access, login_required]

    def get(self, sensor_id):
        """Get All events associated with the sensor"""
        sensor = Sensor.query.filter(Sensor.uid == sensor_id).filter(Sensor.deleted == False).first()
        result_events = []
        for event_ass in sensor.events:
            result_events.append(event_ass.event)
        return EventSchema(many=True).dump(result_events)

    def post(self, sensor_id):
        """Add attach a new event to a sensor."""
        data = request.json
        if isinstance(data['event_ids'], list):
            event_ids = data['event_ids']
        else:
            event_ids = [data['event_ids']]
        sensor = Sensor.query.filter(Sensor.uid == sensor_id).filter(Sensor.deleted == False).first()
        try:
            existing_event_ids = [a.event_id for a in SensorEventAssociation.query.filter(
                SensorEventAssociation.sensor_id == sensor.id)]
            events = Event.query.filter(Event.company_id == sensor.company_id).\
                filter(Event.actuator_type.in_([sensor.type, 'all'])).\
                filter(Event.id.in_(event_ids)).\
                filter(~Event.id.in_(existing_event_ids)).\
                filter(Event.deleted_at == None)
            for event in events:
                assoc = SensorEventAssociation(sensor_id=sensor.id, event_id=event.id)
                db.session.add(assoc)
            db.session.commit()
            return {}
        except Exception as e:
            _LOGGER.error(e)
            return {}, 500

    def delete(self, sensor_id):
        """Remove events form the sensor"""
        data = request.json
        sensor = Sensor.query.filter(Sensor.uid == sensor_id).filter(Sensor.deleted == False).first()
        try:
            existing_event_ids = [a.id for a in Event.query.filter(Event.id.in_(data["event_ids"]))]
            r = SensorEventAssociation.query.filter(SensorEventAssociation.sensor_id == sensor.id).\
                filter(SensorEventAssociation.event_id.in_(existing_event_ids)).\
                delete(synchronize_session=False)
            db.session.commit()
            return {"deleted_rows": r}
        except Exception as e:
            _LOGGER.error(e)
            return {}, 500
