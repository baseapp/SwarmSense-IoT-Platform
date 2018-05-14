# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from flask_restful import reqparse
from flask_restful import Resource
from flask import make_response

from snms.core.logger import Logger
from snms.modules.sensors import Sensor
from snms.modules.users import User
from snms.modules.companies import Company
_LOGGER = Logger.get(__name__)


class UserPathResource(Resource):
    """User login resource."""

    parser = reqparse.RequestParser()
    parser.add_argument('username', type=str, required=True, help="Username is required")
    parser.add_argument('password', type=str, required=True, help="Password is required")

    def post(self):
        """User Login"""
        args = self.parser.parse_args()
        _LOGGER.debug(args)

        username = args['username']
        password = args['password']
        if username.startswith('sensor'):
            sensor_uid = username.split("_")[1]
            sensor = Sensor.query.filter(Sensor.uid == sensor_uid) \
                .filter(Sensor.key == password).filter(Sensor.deleted == False).first()
            _LOGGER.debug("Sensor UID %s", sensor_uid)
            if sensor:
                return make_response("allow")
        elif username.startswith('company'):
            company_uid = username.split("_")[1]
            company = Company.query.filter(Company.uid == company_uid) \
                .filter(Company.key == password).filter(Company.deleted == False).first()
            _LOGGER.debug("Company UID %s", company_uid)
            if company:
                return make_response("allow")
        # else:
        #     if username == 'admin' and password == 'admin':
        #         return make_response("allow administrator")
        _LOGGER.debug("Access Denied: %s, %s" % (username, password))
        return make_response("deny")


class VhostPathResource(Resource):
    """User login resource."""

    parser = reqparse.RequestParser()
    parser.add_argument('username', type=str, required=True, help="Username is required")
    parser.add_argument('vhost', type=str, required=True, help="Password is required")
    parser.add_argument('ip', type=str, required=True, help="Password is required")

    def post(self):
        """User Login"""
        mqtt_vhost = '/'
        args = self.parser.parse_args()
        _LOGGER.debug(args)
        username = args['username']
        if username.startswith('sensor') or username.startswith('company'):
            if args['vhost'] == mqtt_vhost:
                return make_response("allow")
            else:
                _LOGGER.debug("Access Host Denied: %s, %s" % (username, args['vhost']))
                return make_response("deny")

        return make_response("allow")


class ResourcePathResource(Resource):
    """User login resource."""

    parser = reqparse.RequestParser()
    parser.add_argument('username', type=str, required=True, help="Username is required")
    parser.add_argument('vhost', type=str, required=True, help="Vhost is required")
    parser.add_argument('resource', type=str, required=True, help="Resource is required")
    parser.add_argument('name', type=str, required=True, help="Name is required")
    parser.add_argument('permission', type=str, required=True, help="Permission is required")

    def post(self):
        """User Login"""
        args = self.parser.parse_args()
        _LOGGER.debug(args)
        username = args['username']
        resource = args['resource']
        name = args['name']
        if username.startswith('sensor') and resource=='topic':
            sensor_uid = username.split("_")[1]
            if name == 'sensors/{}/values'.format(sensor_uid):
                return make_response("allow")
            elif name == 'sensors/{}/configuration'.format(sensor_uid):
                return make_response("allow")
            else:
                _LOGGER.debug("Resource Denied: %s, %s" % (username, name))
                return make_response("deny")
        elif username.startswith('company') and resource=='topic':
            company_uid = username.split("_")[1]
            company = Company.query.filter(Company.uid == company_uid).filter(Company.deleted == False).first()
            try:
                sensor_uid = name.split('/')[1]
            except:
                return make_response("deny")
            sensor = Sensor.query.filter(Sensor.uid == sensor_uid).filter(Sensor.deleted == False).first()
            if company and sensor.company_id == company.id and name.startswith('sensors/'):
                return make_response("allow")
            else:
                _LOGGER.debug("Resource Denied: %s, %s" % (username, name))
                return make_response("deny")
        return make_response("allow")


class TopicPathResource(Resource):
    """User login resource."""

    parser = reqparse.RequestParser()
    parser.add_argument('username', type=str, required=True, help="Username is required")
    parser.add_argument('vhost', type=str, required=True, help="vhost is required")
    parser.add_argument('resource', type=str, required=True, help="resource is required")
    parser.add_argument('name', type=str, required=True, help="name is required")
    parser.add_argument('permission', type=str, required=True, help="permission is required")
    parser.add_argument('routing_key', type=str, required=True, help="routing_key is required")

    def post(self):
        args = self.parser.parse_args()
        _LOGGER.debug(args)

        return make_response("allow")