# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Network Database Model"""
import posixpath
from datetime import datetime

from snms.core.db import db
from snms.core.storage import StoredFileMixin
from snms.core.config import config

network_sensor_table = db.Table('network_sensor', db.Model.metadata,
    db.Column('network_id', db.Integer, db.ForeignKey('networks.id')),
    db.Column('sensor_id', db.Integer, db.ForeignKey('sensors.id')),
    db.PrimaryKeyConstraint('network_id', 'sensor_id')
)


class Network(StoredFileMixin, db.Model):
    """Network database model."""
    __tablename__ = 'networks'
    add_file_date_column = False
    file_required = False

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'))
    deleted = db.Column(db.Boolean, default=False)
    uid = db.Column(db.String, unique=True)

    last_update = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    sensors = db.relationship(
        "Sensor",
        secondary=network_sensor_table,
        back_populates="networks")
    company = db.relationship("Company", back_populates="networks")
    alerts = db.relationship(
        "NetworkAlertAssociation",
        back_populates="networks")

    def _build_storage_path(self):
        self.assign_id()
        path_segments = ['floormaps', (self.uid)]
        path = posixpath.join(*(path_segments + ['{}_{}'.format(self.id, self.filename)]))
        return config.FLOORMAP_STORAGE, path