# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Network Resources"""
from functools import wraps

import werkzeug
from flask_restful import Api, Resource, reqparse
from flask import g, jsonify, Blueprint, request
from werkzeug.exceptions import Unauthorized, Forbidden, NotFound, InternalServerError
from sqlalchemy import func, and_

from snms.models import add_event_log
from snms.core.db import db
from snms.modules.networks import Network, network_sensor_table
from snms.modules.companies import Company, company_required
from snms.modules.sensors import Sensor
from snms.modules.sensors.controllers import access_control
from snms.modules.sensors.schema import SensorRequestSchema
from snms.common.auth import login_required
from snms.utils import get_filters
from snms.utils.crypto import generate_uid
from snms.core.logger import Logger

_LOGGER = Logger.get()


def network_required(f):
    """
    Decorator to check if company has network
    :param f:
    :return:
    """

    @wraps(f)
    def decorated_function(*args, **kwargs):
        company_id = kwargs['company_id']
        network_id = kwargs['network_id']
        company = Company.query.filter(Company.uid == company_id).filter(Company.deleted == False).first()
        network = Network.query.filter(db.and_(Network.uid == network_id, Network.company_id == company.id)).filter(
            Network.deleted == False).first()
        if network is None:
            raise NotFound("Network not found")
        return f(*args, **kwargs)

    return decorated_function


class NetworksCollectionResource(Resource):
    """Network Collection Resource."""
    method_decorators = [company_required, login_required]

    def get(self, company_id):
        """Get All Network for company"""
        order_by, order_type, offset, limit, filter = get_filters(in_request=request)

        networks = db.session.query(Network, func.count(Sensor.id), Sensor.is_down).join(Company, Company.id == Network.company_id). \
            outerjoin(network_sensor_table, Network.id == network_sensor_table.c.network_id). \
            outerjoin(Sensor, and_(Sensor.id == network_sensor_table.c.sensor_id, Sensor.deleted == False)). \
            filter(Company.uid == company_id).filter(Network.deleted == False). \
            group_by(Network.id).group_by(Sensor.is_down).order_by(Network.name).all()

        all_networks = {}
        for network, count, is_down in networks:
            if network.uid in all_networks.keys():
                all_networks[network.uid]['sensor_count'] += count
            else:
                all_networks[network.uid] = {
                            'name': network.name,
                            'id': network.uid,
                            'floormap': network.filename,
                            'sensor_count': count,
                            'sensors_off': 0,
                            'sensors_on': 0
                        }

            if is_down:
                all_networks[network.uid]['sensors_off'] += count

            all_networks[network.uid]['sensors_on'] = all_networks[network.uid]['sensor_count'] - all_networks[network.uid]['sensors_off']
        networks_list = list(all_networks.values())
        networks_list = sorted(networks_list, key=lambda a: a['name'].upper())
        return {
            "data": networks_list[offset:offset + limit],
            "total": len(networks_list)
        }

    def post(self, company_id):
        """Add new Network to the company."""
        # Add network to the company
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=True, help="Name is required")
        parser.add_argument('floormap', type=werkzeug.FileStorage, location='files')
        args = parser.parse_args()
        network = Network(name=args['name'], uid=generate_uid())
        _floormap = args['floormap']
        if _floormap:
            network.filename = _floormap.filename
            network.content_type = _floormap.mimetype
            try:
                network.save(_floormap.read())
            except Exception as e:
                _LOGGER.error("Error in file save")
                _LOGGER.error(e.args)
                return {}, 500
        company = Company.query.filter(Company.uid == company_id).filter(Company.deleted == False).first()
        try:
            db.session.add(network)
            company.networks.append(network)
            db.session.commit()
            add_event_log(company_id=company_id, network_id=network.uid, log="Network Created: {}".format(network.name))
            return {"id": network.uid}, 201
        except Exception as e:
            _LOGGER.error(e)
            db.session.rollback()
            return {"message": "Internal server error"}, 500


class NetworksResource(Resource):
    """Network resource."""
    method_decorators = [network_required, company_required, login_required]

    def get(self, company_id, network_id):
        """Get Network details"""
        network = Network.query.filter(Network.uid == network_id).filter(Network.deleted == False).first()
        return {"name": network.name, "id": network.uid, "floormap": network.filename}

    def put(self, company_id, network_id):
        """Update Network details"""
        network = Network.query.filter(Network.uid == network_id).filter(Network.deleted == False).first()
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=True, help="Name is required")
        parser.add_argument('floormap', type=werkzeug.FileStorage, location='files')
        args = parser.parse_args()
        network.name = args['name']
        _floormap = args['floormap']
        if _floormap:
            if network.filename:
                try:
                    network.delete()
                except Exception as e:
                    _LOGGER.error(e)
            network.filename = _floormap.filename
            network.content_type = _floormap.mimetype
            try:
                network.save(_floormap.read())
            except Exception as e:
                _LOGGER.error("Error in file save")
                _LOGGER.error(e.args)
                return {}, 500
        try:
            db.session.add(network)
            db.session.commit()
            return {}, 204
        except Exception as e:
            _LOGGER.error(e)
            raise InternalServerError

    def delete(self, company_id, network_id):
        """Delete Network from database."""
        network = Network.query.filter(Network.uid == network_id).filter(Network.deleted == False).first()
        network.deleted = True
        db.session.add(network)
        db.session.commit()
        add_event_log(company_id=company_id, network_id=network.uid, log="Network Deleted: {}".format(network.name))
        return {}, 204


class NetworksSensorsCollectionResource(Resource):
    """Network Sensors Collection Resource."""
    method_decorators = [network_required, company_required, login_required]

    def get(self, company_id, network_id):
        """Get All sensors of a network"""
        order_by, order_type, offset, limit, filter = get_filters(in_request=request)
        network = Network.query.filter(Network.uid == network_id).filter(Network.deleted == False).first()
        sensors = Sensor.query.join(Network.sensors).filter(Network.uid == network_id).filter(Sensor.deleted == False)
        if 'q' in filter.keys():
            sensors = sensors.filter(Sensor.name.ilike("%{}%".format(filter['q'])))
        count = sensors.count()
        result_sensors = []
        for sensor in sensors[offset:offset + limit]:
            data, errors = SensorRequestSchema().dump(sensor)
            result_sensors.append(data)
        return {"data": result_sensors, "total": count}

    def post(self, company_id, network_id):
        """Add new new sensors to a Network."""
        data = request.json
        network = Network.query.filter(Network.uid == network_id).filter(Network.deleted == False).first()
        company = Company.query.filter(Company.uid == company_id).filter(Company.deleted == False).first()
        try:
            for id in data["sensor_ids"]:
                sensor = Sensor.query.filter(Sensor.uid == str(id)).filter(Sensor.deleted == False).first()
                if sensor is None:
                    _LOGGER.debug("Sensor not found")
                elif sensor.company_id == company.id:
                    network.sensors.append(sensor)
            db.session.add(network)
            db.session.commit()
            return {}
        except Exception as e:
            _LOGGER.error(e)
            return {}, 500

    def delete(self, company_id, network_id):
        """Remove a sensor for network"""
        data = request.json
        network = Network.query.filter(Network.uid == network_id).filter(Network.deleted == False).first()
        company = Company.query.filter(Company.uid == company_id).filter(Company.deleted == False).first()
        try:
            for id in data["sensor_ids"]:
                sensor = Sensor.query.filter(Sensor.uid == id).filter(Sensor.deleted == False).first()
                if sensor is None:
                    # TODO: Log error.
                    pass
                elif sensor.company_id == company.id:
                    network.sensors.remove(sensor)
            db.session.add(network)
            db.session.commit()
            return {}
        except Exception as e:
            _LOGGER.error(e)
            return {}, 500


class FloorMapResource(Resource):
    """FloorMap Resource Controller"""

    method_decorators = [network_required, access_control]

    def get(self, company_id, network_id):
        """Get floor map for network"""
        network = Network.query.filter(Network.uid == network_id).filter(Network.deleted == False).first()
        if network.storage_file_id:
            return network.send()
        else:
            return {}, 404

    def post(self, company_id, network_id):
        _parser = reqparse.RequestParser()
        _parser.add_argument('floormap', type=werkzeug.FileStorage, location='files', required=True)
        args = _parser.parse_args()
        network = Network.query.filter(Network.uid == network_id).filter(Network.deleted == False).first()
        _floormap = args['floormap']
        if _floormap:
            if network.filename:
                try:
                    network.delete()
                except Exception as e:
                    _LOGGER.error(e)
            network.filename = _floormap.filename
            network.content_type = _floormap.mimetype
            try:
                network.save(_floormap.read())
            except Exception as e:
                _LOGGER.error("Error in file save")
                _LOGGER.error(e.args)
                return {}, 500
            db.session.add(network)
            db.session.commit()
            return {}
        else:
            return {}, 500

    def delete(self, company_id, network_id):
        network = Network.query.filter(Network.uid == network_id).filter(Network.deleted == False).first()
        network.delete()
        db.session.add(network)
        db.session.commit()
        return {}, 200