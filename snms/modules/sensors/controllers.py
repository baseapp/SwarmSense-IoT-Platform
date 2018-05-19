# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Sensor Resources"""
# pylint: disable=invalid-name, import-error
import uuid
from functools import wraps
from flask_restful import Api, Resource, reqparse
from flask import g, request, Response, make_response, url_for
from werkzeug.exceptions import Unauthorized, Forbidden, NotFound, InternalServerError
import datetime
import werkzeug
from sqlalchemy.types import String, Float, Integer
import json
from dateutil import parser
import pytz

from snms.models import add_event_log
from snms.database import tsdb
from snms.core.db import db
from snms.core.logger import Logger
from snms.modules.companies import Company, company_required, user_company_acl_role
from snms.modules.sensors import Sensor, get_all_types
from .schema import SensorRequestSchema, ValueSchema
from snms.common.auth import login_required
from snms.utils import get_filters
from snms.utils.check_alerts import process_sensor_alerts
from snms.common.auth import DecodeError, parse_token, ExpiredSignature
from snms.modules.users import User
from snms.utils.crypto import get_random_string, generate_uid, generate_key
from snms.modules.alerts import SensorAlertAssociation
from snms.modules.files import BinFile
from snms.core.mqtt import mqtt
from snms.const import ROLE_ADMIN, ROLE_READ, ROLE_WRITE

_LOGGER = Logger.get()


def user_sensor_access(f):
    """
    Decorator to check is user has the sensor access
    :param f:
    :return:
    """

    @wraps(f)
    def decorated_function(*args, **kwargs):
        sensor_uid = kwargs['sensor_id']
        sensor = Sensor.query.filter(Sensor.uid == sensor_uid).filter(Sensor.deleted == False).first()
        if sensor is None:
            raise NotFound("Sensor not found")
        user = g.user
        role = user_company_acl_role(user.id, sensor.company_id)
        if user.is_super_admin() or role:
            if user.is_super_admin():
                g.company_user_role = ROLE_ADMIN
            else:
                g.company_user_role = role
            return f(*args, **kwargs)
        raise Forbidden()

    return decorated_function


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


class SensorsCollectionResource(Resource):
    """Sensor Collection Resource."""
    method_decorators = [access_control]

    def get(self, company_id):
        """Get All sensors for user"""
        order_by, order_type, offset, limit, filter = get_filters(in_request=request)
        company = Company.query.filter(Company.uid == company_id).filter(Company.deleted == False).first()
        sensors = Sensor.query.filter(Sensor.company_id == company.id).filter(Sensor.deleted == False)
        if 'q' in filter.keys():
            sensors = sensors.filter(Sensor.name.ilike("%{}%".format(filter['q'])))
        if 'type' in filter.keys():
            sensors = sensors.filter(Sensor.type == filter['type'])
        # sensors = sensors.order_by(Sensor.value[order_by].cast(Float).desc())
        # NOTE: Only valid for PostgreSQL Database
        if order_by in ['id', 'uid', 'type', 'description', 'name', 'last_update', 'created_at', 'is_down']:
            sensors = sensors.order_by(db.text(order_by + " " + order_type))
        result_sensors = []
        sensor_types = get_all_types()
        for sensor in sensors[offset:offset + limit]:
            data, errors = SensorRequestSchema().dump(sensor)
            role = g.company_user_role
            if not role or role == ROLE_READ:
                del(data['key'])
            if data['value']:
                value_fields = sensor_types[sensor.type]['fields']
                for field_name, field in value_fields.items():
                    if field['type'] == 'file':
                        data['value'][field_name] = url_for('files.fileresource', sensor_id=sensor.uid, uid=data['value'][field_name], sensor_key=sensor.key, _external=True) if data['value'][field_name] else ''
            result_sensors.append(data)
        return {"data": result_sensors, "total": sensors.count()}

    def post(self, company_id):
        """Add new sensor to the company."""
        company = Company.query.filter(Company.uid == company_id).filter(Company.deleted == False).first()
        data, errors = SensorRequestSchema().load(request.get_json())
        if errors:
            return errors, 422
        _LOGGER.info(data)
        if not data['key']:
            data["key"] = generate_key()
        data["uid"] = generate_uid()
        if not data['hid']:
            data["hid"] = data["uid"]
        sensor = Sensor(**data)
        sensor_types = get_all_types()
        config_fields = sensor_types[data['type']]['config_fields']
        if config_fields is not None:
            sensor.config = {field['name']: field['default'] for field in config_fields.values() if 'default' in field.keys()}
        else:
            sensor.config = {}
        sensor.config_updated = datetime.datetime.utcnow()
        db.session.add(sensor)
        company.sensors.append(sensor)
        db.session.commit()
        add_event_log(company_id=company_id, sensor_id=sensor.uid, log="Sensor Added : {}".format(sensor.name))
        return SensorRequestSchema().dump(sensor)[0], 201


class SensorsByTypeResource(Resource):
    """Sensors List by type"""
    method_decorators = [access_control]

    def get(self, company_id, sensor_type):
        """Get All sensors for user"""
        order_by, order_type, offset, limit, filter = get_filters(in_request=request)
        all_types = get_all_types()
        if sensor_type not in all_types.keys():
            raise NotFound("Sensor Type not found")
        company = Company.query.filter(Company.uid == company_id).filter(Company.deleted == False).first()
        sensors = Sensor.query.filter(Sensor.company_id == company.id)\
            .filter(Sensor.type == sensor_type)\
            .filter(Sensor.deleted == False)
        # TODO: Only valid for PostgreSQL Database
        if 'q' in filter.keys():
            sensors = sensors.filter(Sensor.name.ilike("%{}%".format(filter['q'])))
        if order_by in ['id', 'uid', 'description', 'name', 'last_update', 'created_at']:
            sensors = sensors.order_by(db.text(order_by + " " + order_type))
        elif order_by:
            sensors = sensors.order_by(
                db.text("CAST(sensors.value #>> '{" + order_by + "}' AS FLOAT) " + order_type))
        result_sensors = []
        for sensor in sensors[offset:offset + limit]:
            data, errors = SensorRequestSchema().dump(sensor)
            role = g.company_user_role
            if not role or role == ROLE_READ:
                del(data['key'])
            result_sensors.append(data)
        return {"data": result_sensors, "total": sensors.count()}


class SensorsResource(Resource):
    """Sensor resource."""
    method_decorators = [access_control]

    def get(self, sensor_id, company_id=None):
        """Get sensor details"""
        sensor = Sensor.query.filter(Sensor.uid == sensor_id).filter(Sensor.deleted == False).first()
        data, errors = SensorRequestSchema().dump(sensor)
        role = g.company_user_role
        if not role or role == ROLE_READ:
            del(data['key'])
        return data

    def put(self, sensor_id, company_id=None):
        """Update Sensor details"""
        sensor = Sensor.query.filter(Sensor.uid == sensor_id).filter(Sensor.deleted == False).first()
        data, errors = SensorRequestSchema().load(request.get_json())
        if errors:
            return errors, 422
        try:
            sensor.name = data["name"]
            sensor.location_lat = data["location_lat"]
            sensor.location_long = data["location_long"]
            sensor.time_start = data["time_start"]
            sensor.time_end = data["time_end"]
            sensor.hid = data["hid"]
            db.session.add(sensor)
            db.session.commit()
            return {}
        except Exception as e:
            _LOGGER.error(e)
            return {"message": e}, 500


    def delete(self, sensor_id, company_id=None):
        """Delete sensor from database."""
        # TODO: Delete time series data for the sensor.
        try:
            sensor = Sensor.query.filter(Sensor.uid == sensor_id).filter(Sensor.deleted == False).first()
            # count = SensorAlertAssociation.query.filter(SensorAlertAssociation.sensor_id == sensor.id).delete()
            sensor.deleted = True
            db.session.add(sensor)
            db.session.commit()
            add_event_log(company_id=sensor.company.uid, sensor_id=sensor.uid, log="Sensor Deleted : {}".format(sensor.name))
            return {}, 204
        except Exception as e:
            _LOGGER.error(e)
            return {"message": e}, 500


class SensorConfigResource(Resource):
    """
    Sensor Configuration Resource.

    Get or Update the sensor configuration.
    """
    method_decorators = [access_control]

    def get(self, sensor_id):
        """Get the sensor configuration"""
        sensor = Sensor.query.filter(Sensor.uid == sensor_id).filter(Sensor.deleted == False).first()
        data, errors = SensorRequestSchema().dump(sensor)
        if data['config']:
            return data['config']
        sensor_types = get_all_types()
        config_fields = sensor_types[data['type']]['config_fields']
        if config_fields is not None:
            return {field['name']: field['default'] for field in config_fields.values() if 'default' in field.keys()}
        else:
            return {}

    def put(self, sensor_id):
        """Update sensor configuration"""
        sensor = Sensor.query.filter(Sensor.uid == sensor_id).filter(Sensor.deleted == False).first()
        conf = dict(sensor.config)
        conf.update(request.get_json())
        sensor.config = conf
        sensor.config_updated = datetime.datetime.utcnow()
        db.session.add(sensor)
        db.session.commit()
        mqtt.publish('sensors/{}/configuration'.format(sensor_id), json.dumps(conf))
        return {}


class SensorHIDConfigResource(Resource):
    """
    Sensor Configuration Resource.

    Get or Update the sensor configuration.
    """
    method_decorators = [access_control]

    def get(self, company_id, sensor_hid):
        """Get the sensor configuration"""
        company = Company.query.filter(Company.uid == company_id).filter(Company.deleted == False).first()
        sensor = Sensor.query.filter(Sensor.company_id == company.id)\
            .filter(Sensor.hid == sensor_hid)\
            .filter(Sensor.deleted == False).first()
        if not sensor:
            return {}, 404
        data, errors = SensorRequestSchema().dump(sensor)
        if data['config']:
            return data['config']
        sensor_types = get_all_types()
        config_fields = sensor_types[data['type']]['config_fields']
        if config_fields is not None:
            return {field['name']: field['default'] for field in config_fields.values() if 'default' in field.keys()}
        else:
            return {}

    def put(self, company_id, sensor_hid):
        """Update sensor configuration"""
        company = Company.query.filter(Company.uid == company_id).filter(Company.deleted == False).first()
        sensor = Sensor.query.filter(Sensor.company_id == company.id)\
            .filter(Sensor.hid == sensor_hid)\
            .filter(Sensor.deleted == False).first()
        if not sensor:
            return {}, 404
        conf = dict(sensor.config)
        conf.update(request.get_json())
        sensor.config = conf
        sensor.config_updated = datetime.datetime.utcnow()
        db.session.add(sensor)
        db.session.commit()
        mqtt.publish('sensors/{}/configuration'.format(sensor.uid), json.dumps(conf))
        return {}


class SensorHIDConfigAck(Resource):
    """
    Sensor Configuration Updated to the sensor.

    Acknowledgement for sensor configuration update..
    """
    method_decorators = [access_control]

    def post(self, company_id, sensor_hid):
        company = Company.query.filter(Company.uid == company_id).filter(Company.deleted == False).first()
        sensor = Sensor.query.filter(Sensor.company_id == company.id)\
            .filter(Sensor.hid == sensor_hid)\
            .filter(Sensor.deleted == False).first()
        if not sensor:
            return {}, 404
        sensor.config_updated = None
        db.session.add(sensor)
        db.session.commit()
        return {}


def time_in_range(start, end, x):
    """Return true if x is in the range [start, end]"""
    if not start:
        start = datetime.time.min
    if not end:
        end = datetime.time.max
    if start <= end:
        return start <= x <= end
    else:
        return start <= x or x <= end


def post_sensor_value_with_uid(sensor_uid, data, now, from_mqtt=False):
    sensor = Sensor.query.filter(Sensor.uid == sensor_uid).filter(Sensor.deleted == False).first()
    if sensor is None:
        _LOGGER.info("Sensor not found")
        return
    post_sensor_values(sensor, data, now, from_mqtt)


def post_sensor_values(sensor, args=None, now=None, from_mqtt=False):
    if not time_in_range(sensor.time_start, sensor.time_end, datetime.datetime.utcnow().time()):
        return {}

    sensor_types = get_all_types()
    ip = None

    # TODO: For MQTT, 'use' now from function params.
    request_time = None

    if not from_mqtt:
        _parser = reqparse.RequestParser()
        for key, field in sensor_types[sensor.type]['fields'].items():
            if field['type'] == 'file':
                _parser.add_argument(key, type=werkzeug.FileStorage, location='files')
            else:
                _parser.add_argument(key, type=float)
        _parser.add_argument('time')
        args = _parser.parse_args()

        if 'time' in args.keys():
            request_time = args['time']
            del args['time']

        for field_name in list(args.keys()):
            if sensor_types[sensor.type]['fields'][field_name]['type'] == 'file':
                # File type field, save the file to another DB and get the ID or UUID
                input_file = args[field_name]
                file_uid = str(uuid.uuid4())
                meta = {
                    'filename': input_file.filename,
                    'mimetype': input_file.mimetype
                }
                new_file = BinFile(sensor_id=sensor.id, file=input_file.read(), meta_info=meta, uid=file_uid)
                db.session.add(new_file)
                args[field_name] = file_uid

        ip = request.remote_addr

    now = datetime.datetime.now(datetime.timezone.utc)
    lat = None
    lng = None

    for field_name in list(args.keys()):
        if sensor_types[sensor.type]['fields'][field_name]['type'] == 'latitude':
            lat = args[field_name]
        elif sensor_types[sensor.type]['fields'][field_name]['type'] == 'longitude':
            lng = args[field_name]
    # db.session.commit()
    if request_time is not None:
        # TODO: Timezone naive issue
        try:
            time = parser.parse(request_time, ignoretz=True)
            diff = (now - time).days
            if -1 <= diff <= 1:
                args['time'] = request_time
            else:
                args['time'] = now.isoformat()
        except Exception as e:
            _LOGGER.error('Date parse error : %s', e)
            args['time'] = now.isoformat()
    if sensor.is_inactive:
        process_sensor_alerts(sensor, None, backup_alert=True, seconds=(now - sensor.last_update.replace(tzinfo=datetime.timezone.utc)).total_seconds())
    data = {'value': args, 'last_update': now.replace(tzinfo=None), 'is_down': False, 'is_inactive': False, 'ip': ip}
    if lat:
        data['location_lat'] = lat
    if lng:
        data['location_long'] = lng
    Sensor.query.filter(Sensor.id == sensor.id).update(data)
    # TODO: Add value with sensor UID
    # TODO: Add time from request
    tsdb.add_point(sensor, data['value'])
    process_sensor_alerts(sensor, data['value'])
    sensor_uid = sensor.uid
    db.session.commit()

    if not from_mqtt:
        if request_time is None:
            args['time'] = now.isoformat()
        # Publish the sensor value to MQTT channel.
        try:
            args['fromServer'] = True
            mqtt.publish('sensors/{}/values'.format(sensor_uid), json.dumps(args))
        except Exception as e:
            _LOGGER.error(e)
    return {}


class SensorValueResource(Resource):
    """
    Sensor Value Resource.

    Get or Update the sensor reading.
    """
    method_decorators = [access_control]

    def get(self, sensor_id):
        """Get the sensor value/reading"""
        # TODO: Get value based on schema
        sensor = Sensor.query.filter(Sensor.uid == sensor_id).filter(Sensor.deleted == False).first()
        data, errors = ValueSchema().dump(sensor)
        if errors:
            return errors, 422
        return data

    def post(self, sensor_id):
        """Update sensor value"""
        # TODO: Update Value based on schema
        sensor = g.sensor
        if sensor is None:
            sensor = Sensor.query.filter(Sensor.uid == sensor_id).filter(Sensor.deleted == False).first()
        post_sensor_values(sensor)
        if sensor.config_updated:
            return {"config": True}
        return {"config": False}


class SensorHistoryResource(Resource):
    """Sensor value history resource"""
    method_decorators = [access_control]

    def get(self, sensor_id):
        """
        Get sensor value history.
        :param sensor_id: Sensor ID
        """
        order_by, order_type, offset, limit, filter = get_filters(in_request=request)
        sensor = Sensor.query.filter(Sensor.uid == sensor_id).filter(Sensor.deleted == False).first()
        duration = None
        start_date = None
        end_date = None
        group_duration = None
        if "group_duration" in filter.keys():
            group_duration = filter["group_duration"]

        if "duration" in filter.keys():
            duration = filter["duration"]
        else:
            if "start_date" in filter.keys():
                start_date = filter['start_date']
            if "end_date" in filter.keys():
                end_date = filter['end_date']
                if parser.parse(end_date) > pytz.utc.localize(datetime.datetime.utcnow()):
                    end_date = datetime.datetime.utcnow().replace(microsecond=0).isoformat()+".000Z"
                    _LOGGER.debug(end_date)
        order_type = 'DESC'
        sensor_types = get_all_types()
        value_fields = sensor_types[sensor.type]['fields']
        points = tsdb.get_points(sensor, limit=limit, offset=offset, order_by="time " + order_type,
                                 duration=duration, start_date=start_date, end_date=end_date, group_duration=group_duration, value_fields= value_fields)
        points['fields'] = None
        if sensor.type in sensor_types.keys():
            points['fields'] = value_fields
            for field_name, field in value_fields.items():
                # Do not show files in grouped data
                if field['type'] == 'file' and group_duration is None:
                    for point in points['data']:
                        point[field_name] = url_for('files.fileresource', sensor_id=sensor.uid, uid=point[field_name], sensor_key=sensor.key, _external=True) if point[field_name] else ''
        return points


class SensorDataExportResource(Resource):
    """Sensor data export resource"""
    method_decorators = [access_control]

    def get(self, sensor_id):
        """
        Get sensor value history.
        :param sensor_id: Sensor ID
        """
        order_by, order_type, offset, limit, filter = get_filters(in_request=request)
        sensor = Sensor.query.filter(Sensor.uid == sensor_id).filter(Sensor.deleted == False).first()
        duration = None
        start_date = None
        end_date = None
        if "duration" in filter.keys():
            duration = filter["duration"]
        else:
            if "start_date" in filter.keys():
                start_date = filter['start_date']
            if "end_date" in filter.keys():
                end_date = filter['end_date']
        points = tsdb.get_points(sensor, limit=limit, offset=offset, order_by="time desc",
                                 duration=duration, start_date=start_date, end_date=end_date)
        sensor_types = get_all_types()
        points['fields'] = None
        if sensor.type in sensor_types.keys():
            points['fields'] = sensor_types[sensor.type]['fields']
        data = points['data']

        def generate_csv():
            if len(data) > 0:
                yield ', '.join([k for k in data[0].keys() if k not in ['company_id', 'sensor_id']]) + '\n'
                for row in data:
                    # _LOGGER.info(list(row.values()))
                    yield ', '.join([str(row[k]) for k in row.keys() if k not in ['company_id', 'sensor_id']]) + '\n'

        return Response(generate_csv(),
                        mimetype='text/csv',
                        headers={'Content-Disposition': 'attachment; filename=sensor_data_{}.csv'.format(sensor_id)})


class SensorHIDResource(Resource):
    method_decorators = [access_control]

    def get(self, company_id, sensor_hid):
        """
        Get sensor by HID

        :param company_id:
        :param sensor_hid:
        :return:
        """
        company = Company.query.filter(Company.uid == company_id).filter(Company.deleted == False).first()
        sensor = Sensor.query.filter(Sensor.company_id == company.id).filter(Sensor.hid == sensor_hid).filter(Sensor.deleted == False).first()
        if sensor is None:
            return {}, 404
        data, errors = SensorRequestSchema().dump(sensor)
        role = g.company_user_role
        if not role or role == ROLE_READ:
            del(data['key'])
        return data


class SensorHIDValuesResources(Resource):
    method_decorators = [access_control]

    def post(self, company_id, sensor_hid):
        company = Company.query.filter(Company.uid == company_id).filter(Company.deleted == False).first()
        sensor = Sensor.query.filter(Sensor.company_id == company.id).filter(Sensor.hid == sensor_hid).filter(Sensor.deleted == False).first()
        if sensor is None:
            return {}, 404
        post_sensor_values(sensor)
        if sensor.config_updated:
            return {"config": True}
        return {"config": False}


class SensorAggregateResource(Resource):
    method_decorators = [access_control]

    def get(self, sensor_id):
        """Get Aggregate values like Min, Max asd Average for sensor"""
        order_by, order_type, offset, limit, filter = get_filters(in_request=request)
        sensor = Sensor.query.filter(Sensor.uid == sensor_id).filter(Sensor.deleted == False).first()
        duration = None
        start_date = None
        end_date = None

        if "duration" in filter.keys():
            duration = filter["duration"]
        else:
            if "start_date" in filter.keys():
                start_date = filter['start_date']
            if "end_date" in filter.keys():
                end_date = filter['end_date']
        order_type = 'DESC'
        points = tsdb.get_points(sensor, order_by="time " + order_type,
                                 duration=duration, start_date=start_date, end_date=end_date, aggregate_only=True)
        return points