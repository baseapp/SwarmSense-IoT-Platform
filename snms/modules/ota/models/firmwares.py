# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Firmwares Database Model"""
import posixpath
from datetime import datetime
from snms.core.db import db
from marshmallow import Schema, fields, ValidationError

from snms.core.storage import StoredFileMixin
from snms.core.config import config


class Firmware(StoredFileMixin, db.Model):
    """
    Firmware Database Model.

    """
    __tablename__ = "firmwares"
    add_file_date_column = False
    file_required = False

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    version = db.Column(db.String)
    sensor_type = db.Column(db.String(50))
    is_deployed = db.Column(db.Boolean, default=False)
    test_sensors = db.Column(db.JSON) # UID list of sensors to test with
    last_update = db.Column(db.DateTime, default=datetime.now())
    created_at = db.Column(db.DateTime, default=datetime.now())

    def _build_storage_path(self):
        self.assign_id()
        path_segments = ['firmwares', (self.sensor_type)]
        path = posixpath.join(*(path_segments + [self.filename]))
        return config.FLOORMAP_STORAGE, path


class FirmwareRequestSchema(Schema):
    """Firmware Request Schema"""
    id = fields.String(dump_only=True)
    name = fields.String(required=True)
    version = fields.String(required=True)
    sensor_type = fields.String(required=True)
    is_deployed = fields.Boolean(missing=False)
    file_name = fields.String(dump_only=True)
    test_sensors = fields.List(fields.String, allow_none=True)
    created_at = fields.DateTime(dump_only=True)
