# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from datetime import datetime
from snms.core.db import db


class BinFile(db.Model):
    """
    Binary files storage table
    """
    __tablename__ = 'bin_files'
    __bind_key__ = 'files'

    id = db.Column(db.Integer, primary_key=True)
    file = db.Column(db.LargeBinary())
    sensor_id = db.Column(db.Integer)
    uid = db.Column(db.String)
    meta_info = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.now())
