# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from flask_restful import Resource, reqparse
import werkzeug
from flask import request, make_response
from snms.modules.files import BinFile
from snms.core.db import db
from snms.modules.sensors import Sensor
from snms.modules.sensors.controllers import access_control


class FileResource(Resource):
    """
    File Resource
    """
    decorators = [access_control]
    def get(self, sensor_id, uid):
        """get the saved file"""
        sensor = Sensor.query.filter(Sensor.uid == sensor_id).filter(Sensor.deleted == False).first()
        old_file = BinFile.query.filter(BinFile.sensor_id == sensor.id).filter(BinFile.uid == uid).first()
        response = make_response(old_file.file)
        response.headers['Content-Type'] = old_file.meta_info['mimetype']
        response.headers['Content-Disposition'] = 'inline; filename={}'.format(old_file.meta_info['filename'])
        return response
