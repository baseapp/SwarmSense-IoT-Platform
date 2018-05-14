# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Sensor Alert Resources"""

from functools import wraps
from flask import g, request
from flask_restful import Resource
from werkzeug.exceptions import Forbidden, NotFound

from snms.core.db import db
from snms.core.logger import Logger
from snms.modules.companies import Company # , company_user_table
from snms.modules.sensors import Sensor
from snms.modules.alerts import Alert, AlertSchema, SensorAlertAssociation
from snms.common.auth import login_required
from snms.modules.sensors.controllers import user_sensor_access
from snms.const import ALERT_ACTION_TRIGGER

_LOGGER = Logger.get()


class SensorAlertResource(Resource):
    """Sensor Alert Resource"""
    method_decorators = [user_sensor_access, login_required]

    def get(self, sensor_id):
        """Get All alerts associated with the sensor"""
        sensor = Sensor.query.filter(Sensor.uid == sensor_id).filter(Sensor.deleted == False).first()
        result_alerts = []
        for alert_ass in sensor.alerts:
            if alert_ass.alert:
                data, errors = AlertSchema().dump(alert_ass.alert)
                result_alerts.append(data)
        return {"data" : result_alerts, "total": len(result_alerts)}

    def post(self, sensor_id):
        """Add attach a new alert to a sensor."""
        data = request.json
        if isinstance(data['alert_ids'], list):
            alert_ids = data['alert_ids']
        else:
            alert_ids = [data['alert_ids']]
        sensor = Sensor.query.filter(Sensor.uid == sensor_id).filter(Sensor.deleted == False).first()
        try:
            existing_alert_ids = [a.alert_id for a in SensorAlertAssociation.query.filter(
                SensorAlertAssociation.sensor_id == sensor.id)]
            alerts = Alert.query.filter(Alert.company_id == sensor.company_id).\
                filter(Alert.sensor_type.in_([sensor.type, 'all'])).\
                filter(Alert.uid.in_(alert_ids)).\
                filter(~Alert.id.in_(existing_alert_ids)).\
                filter(Alert.deleted == False)
            actuator = None
            for alert in alerts:
                actuator_id = None
                if alert.action_type == ALERT_ACTION_TRIGGER:
                    if not 'actuator_id' in data.keys():
                        return {"error": "actuator_id required for action_type trigger"}, 422
                    actuator_uid = data['actuator_id']
                    if not actuator:
                        actuator = Sensor.query.filter(Sensor.uid == actuator_uid).first()
                    if not actuator:
                        return {"error": "Actuator not found"}, 404
                    actuator_id = actuator.id
                    if alert.actuator_type == actuator.type:
                        pass
                    else:
                        return {"error" : "Actuator types is different"}, 500
                assoc = SensorAlertAssociation(sensor_id=sensor.id, alert_id=alert.id, actuator_id=actuator_id)
                db.session.add(assoc)
            db.session.commit()
            return {}
        except Exception as e:
            _LOGGER.error(e)
            return {}, 500

    def delete(self, sensor_id):
        """Remove alerts form the sensor"""
        data = request.json
        sensor = Sensor.query.filter(Sensor.uid == sensor_id).filter(Sensor.deleted == False).first()
        try:
            existing_alert_ids = [a.id for a in Alert.query.filter(Alert.uid.in_(data["alert_ids"]))]
            r = SensorAlertAssociation.query.filter(SensorAlertAssociation.sensor_id == sensor.id).\
                filter(SensorAlertAssociation.alert_id.in_(existing_alert_ids)).\
                delete(synchronize_session=False)
            db.session.commit()
            return {"deleted_rows": r}
        except Exception as e:
            _LOGGER.error(e)
            return {}, 500
