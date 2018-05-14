# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Sensor types resources"""

from flask import request, g
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError
from sqlalchemy import or_
from werkzeug.exceptions import Forbidden

from snms.database import tsdb
from snms.core.db import db, FromCache
from snms.core.options import options
from snms.core.logger import Logger
from snms.modules.sensors import SensorType, get_all_types, Sensor
from snms.modules.networks import network_sensor_table
from snms.modules.alerts import Alert
from snms.common.schemas import SensorTypeRequestSchema
from snms.common.auth import login_required, admin_required
from snms.database.exceptions import MeasurementNotFound
from snms.modules.sensors.field_types import data_types
from snms.utils import get_filters

_LOGGER = Logger.get()


class SensorTypesCollectionResource(Resource):
    """Sensor types collection resource"""
    method_decorators = [login_required]

    def get(self):
        """Get all the sensor types"""
        user = g.user
        if not user:
            raise Forbidden('Unauthorized access')
        order_by, order_type, offset, limit, filter = get_filters(in_request=request)
        types = SensorType.query\
            .filter(SensorType.deleted == False)\
            .filter(or_(SensorType.is_public == True, SensorType.created_by == user.id))
        result_types = []
        for _type in types[offset : offset + limit]:
            data, errors = SensorTypeRequestSchema().dump(_type)
            result_types.append(data)
        return {
            "data": result_types,
            "total": types.count()
        }

    def post(self):
        """Add a new sensor type"""
        user = g.user
        if not user:
            raise Forbidden('Unauthorized access')
        data, errors = SensorTypeRequestSchema().load(request.get_json())
        if errors:
            return errors, 422
        s_type = data['title'].lower().replace(" ", "_")
        is_public = True
        if not user.is_super_admin():
            is_public = False
            s_type = "{}_{}".format(s_type, user.uid)
        sensor_type = SensorType(type=s_type, is_public=is_public, created_by=user.id, **data)
        try:
            db.session.add(sensor_type)
            db.session.commit()
            tsdb.create_sensor(sensor_type.type, sensor_type.value_fields)
            return {'id': sensor_type.id}
        except IntegrityError as e:
            _LOGGER.error(e)
            return {'message': 'Sensor type already exists.', 'code': 409}, 409
        except Exception as e:
            _LOGGER.error(e)
            db.session.rollback()
            db.session.close()
            return {'message': 'Internal server error', 'code': 500}, 500


class SensorTypeResource(Resource):
    """Sensor type resource"""
    method_decorators = [login_required]

    def get(self, sensor_type_id):
        """Get sensor type"""
        user = g.user
        if not user:
            raise Forbidden('Unauthorized access')
        # sensor_type = SensorType.query.options(FromCache("default")).get(sensor_type_id)
        sensor_type = SensorType.query.get(sensor_type_id)
        if sensor_type is None or sensor_type.deleted:
            return {'message': 'Sensor Type not found', 'code': 404}, 404
        if sensor_type.is_public or sensor_type.created_by == user.id:
            return SensorTypeRequestSchema().dump(sensor_type).data
        raise Forbidden('Unauthorized access')

    def put(self, sensor_type_id):
        """Update Sensor Type"""
        user = g.user
        if not user:
            raise Forbidden('Unauthorized access')
        sensor_type = SensorType.query.get(sensor_type_id)

        if not user.is_super_admin() and sensor_type.created_by != user.id:
            raise Forbidden('Unauthorized access')

        data, errors = SensorTypeRequestSchema().load(request.get_json())
        if errors:
            return errors, 422
        sensor_type.title = data["title"]
        sensor_type.status_timeout = data["status_timeout"]
        sensor_type.value_fields = data["value_fields"]
        sensor_type.config_fields = data["config_fields"]
        db.session.add(sensor_type)
        db.session.commit()
        tsdb.create_sensor(sensor_type.type, sensor_type.value_fields)
        return {}

    def delete(self, sensor_type_id):
        """Delete a sensor type"""
        user = g.user
        if not user:
            raise Forbidden('Unauthorized access')

        sensor_type = SensorType.query.get(sensor_type_id)

        if sensor_type is None:
            return {'message': 'Sensor Type not found', 'code': 404}, 404

        if not user.is_super_admin() and sensor_type.created_by != user.id:
            raise Forbidden('Unauthorized access')

        # TODO: Delete alerts related to sensor_type
        # NOTE: Do not delete sensor data for now
        # try:
        #     tsdb.delete_sensor_type(sensor_type.type)
        # except MeasurementNotFound as e:
        #     _LOGGER.error(e)
        alerts = Alert.query.filter_by(sensor_type=sensor_type.type).all()
        for a in alerts:
            a.deleted = True
            db.session.add(a)
        db.session.commit()
        sensors = Sensor.query.filter_by(type=sensor_type.type).all()
        for s in sensors:
            s.deleted = True
            db.session.add(s)
        db.session.commit()
        # db.session.query(network_sensor_table).filter(network_sensor_table.c.sensor_id.in_())
        if len(sensors) == 0 and len(alerts) == 0:
            db.session.delete(sensor_type)
        else:
            sensor_type.deleted = True
            db.session.add(sensor_type)
        db.session.commit()
        return {'message': 'Sensor Type deleted', 'code': 200}, 200


class AllSensorTypes(Resource):
    """Return all sensor types"""

    def get(self, sensor_type=None):
        all_types = get_all_types()
        if sensor_type:
            return all_types[sensor_type]
        return {"data": all_types, "total": len(all_types.keys())}


class SensorDataTypes(Resource):
    """Data types for sensor fields."""

    def get(self):
        """Get all sensor data types."""
        d_types = [{
            "name": d["name"],
            "alias": d["alias"],
            "format": d["format"],
        } for d in data_types]
        return {"data": d_types, "total": len(d_types)}
