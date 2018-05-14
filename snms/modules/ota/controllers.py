# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Controller for OTA Firmware"""
import os

import werkzeug
from flask import request, send_file
from flask_restful import Resource, reqparse
from snms.core.db import db
from snms.core.logger import Logger
from snms.modules.ota import Firmware, FirmwareRequestSchema
from snms.utils import get_filters
from snms.modules.sensors import Sensor
# from snms.web.util import send_file
_LOGGER = Logger.get()


class FirmwareListResource(Resource):

    def get(self):
        order_by, order_type, offset, limit, filter = get_filters(in_request=request)
        firmwares = Firmware.query
        if 'q' in filter.keys():
            firmwares = firmwares.filter(Firmware.name.ilike("%{}%".format(filter['q'])))
        if 'type' in filter.keys():
            firmwares = firmwares.filter(Firmware.type == filter['type'])
        if order_by in ['id', 'sensor_type', 'name', 'version', 'created_at', 'is_deployed']:
            firmwares = firmwares.order_by(db.text(order_by + " " + order_type))
        result_firmwares = []
        for firmware in firmwares[offset:offset + limit]:
            data = FirmwareRequestSchema().dump(firmware)[0]
            result_firmwares.append(data)
        return {"data": result_firmwares, "total": firmwares.count()}

    def post(self):
        # Add a new firmware
        _parser = reqparse.RequestParser()
        _parser.add_argument("firmware", type=werkzeug.FileStorage, location='files', required=True)
        _parser.add_argument("name", required=True)
        _parser.add_argument("version", required=True)
        _parser.add_argument("sensor_type", required=True)
        _parser.add_argument("is_deployed")
        _parser.add_argument('test_sensors')
        args = _parser.parse_args()
        firmware_file = args["firmware"]
        # Copy the file to the directory
        file_name = firmware_file.filename

        firmware = Firmware.query.filter(Firmware.sensor_type == args["sensor_type"]).first()
        if not firmware:
            firmware = Firmware(
                sensor_type=args["sensor_type"],
                is_deployed=False
            )
        else:
            firmware.delete()
        firmware.version = args["version"]
        firmware.name = args["name"]
        firmware.is_deployed = False
        if type(args["test_sensors"]) == list:
            firmware.test_sensors = args["test_sensors"]
        else:
            firmware.test_sensors = args["test_sensors"].split(",")
        firmware.filename = file_name
        firmware.content_type = firmware_file.mimetype
        try:
            firmware.save(firmware_file.read())
        except Exception as e:
            _LOGGER.error("Error in file save")
            _LOGGER.error(e)
            return {}, 500

        db.session.add(firmware)
        db.session.commit()
        return FirmwareRequestSchema().dump(firmware)[0], 200


class FirmwareResource(Resource):

    def get(self, firmware_id):
        firmware = Firmware.query.get(firmware_id)
        if not firmware:
            return {}, 404
        return FirmwareRequestSchema().dump(firmware)[0]

    def delete(self, firmware_id):
        firmware = Firmware.query.get(firmware_id)
        if not firmware:
            return {}, 404
        db.session.delete(firmware)
        db.session.commit()
        return {}, 204

    def put(self, firmware_id):
        # Content type JSON only
        data, errors = FirmwareRequestSchema().load(request.get_json())
        if errors:
            return errors, 422
        firmware = Firmware.query.get(firmware_id)
        if not firmware:
            return {}, 404
        firmware.name = data["name"]
        firmware.is_deployed = data["is_deployed"]
        firmware.test_sensors = data["test_sensors"]
        db.session.add(firmware)
        db.session.commit()
        return FirmwareRequestSchema().dump(firmware)[0], 200


class FirmwareDownloadResource(Resource):

    def get(self, firmware_id):
        firmware = Firmware.query.get(firmware_id)
        if not firmware:
            return {}, 404
        try:
            return firmware.send()
        except Exception as e:
            _LOGGER.error(e)
            return {}, 500


class FirmwareCheckResource(Resource):

    def get(self):
        version = request.headers.get('X-FW-Version')
        if not version:
            mos_v = request.headers.get('X-MGOS-FW-Version')
            if mos_v:
                version = mos_v.split()[1]
        if not version:
            version = request.args.get('version', None)
        if not version:
            return {"error": "Sensor version is required"}, 404
        sensor_uid = request.headers.get('X-Sensor-Id')
        if not sensor_uid:
            mgos_header = request.headers.get('X-MGOS-Device-ID')
            if mgos_header:
                sensor_hid = mgos_header.split()[0]
                sensor = Sensor.query.filter(Sensor.hid == sensor_hid).first()
                if sensor:
                    sensor_uid = sensor.uid
        if not sensor_uid:
            sensor_uid = request.args.get('sensor_id', None)
        if not sensor_uid:
            return {"error": "Sensor id required"}, 404
        sensor = Sensor.query.filter(Sensor.uid == sensor_uid).first()
        if not sensor:
            return {"error": "Sensor not found"}, 404
        _LOGGER.debug("Firmware Request {} {}".format(sensor_uid, version))
        firmware = Firmware.query.filter(Firmware.sensor_type == sensor.type).first()
        if not firmware:
            return {}, 404
        if firmware.version == version:
            return {"error": "New firmware not found"}, 404
        if not firmware.is_deployed and sensor_uid not in firmware.test_sensors:
            return {}, 404
        try:
            return firmware.send()
        except Exception as e:
            _LOGGER.error(e)
            return {}, 500