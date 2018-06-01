# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Company Resources"""
import datetime

from flask import request
from flask_restful import Resource

from snms.database import tsdb
from snms.utils import get_filters
from snms.core.logger import Logger
from snms.modules.companies import Company, company_required
from snms.modules.sensors import Sensor, get_all_types
from snms.modules.networks import Network
from snms.modules.alerts import Alert
from snms.common.auth import login_required
from snms.const import ALERT_HISTORY_SERIES, DAILY_ANALYTICS_SERIES, \
    EVENT_LOG_SERIES


_LOGGER = Logger.get()


class DashboardResource(Resource):

    method_decorators = [company_required, login_required]

    def get(self, company_id):
        company = Company.query.filter(Company.uid == company_id).filter(Company.deleted == False).first()
        total_sensors = Sensor.query.filter(Sensor.company_id == company.id).filter(Sensor.deleted == False).count()
        total_sensors_down = Sensor.query.filter(Sensor.company_id == company.id).filter(Sensor.deleted == False).filter(Sensor.is_down == True).count()
        total_network = Network.query.filter(Network.company_id == company.id).filter(Network.deleted == False).count()
        total_alerts = Alert.query.filter(Alert.company_id == company.id).filter(Alert.deleted == False).count()
        event_logs = tsdb.get_points_raw(EVENT_LOG_SERIES, tags={'company_id': company_id}, order_by='time desc', limit=10, offset=0)

        return {
            "total_sensors": total_sensors,
            "total_sensors_up": total_sensors - total_sensors_down,
            "total_sensors_down": total_sensors_down,
            "total_network": total_network,
            "total_alerts": total_alerts,
            "event_logs": event_logs['data']
        }

class CompanyStatsResource(Resource):
    method_decorators = [company_required, login_required]

    def get(self, company_id):
        """Get Company status"""

        now = datetime.datetime.utcnow()
        last_hr = now - datetime.timedelta(hours=1)
        _LOGGER.info(last_hr)
        company = Company.query.filter(Company.uid == company_id).filter(Company.deleted == False).first()
        total_sensors = Sensor.query.filter(Sensor.company_id == company.id).filter(Sensor.deleted == False).count()
        total_sensors_down = Sensor.query.filter(Sensor.company_id == company.id).filter(Sensor.deleted == False).filter(Sensor.is_down == True).count()
        alert_logs = tsdb.get_points_raw(
            ALERT_HISTORY_SERIES,
            tags={'company_id': company_id},
            order_by='time desc',
            limit=10,
            offset=0,
            duration='1h',
            count_only=True
        )

        all_types = get_all_types()
        all_measurements = list(all_types.keys())
        message_logs = tsdb.get_points_raw(
            all_measurements,
            tags={'company_id': company.id},
            order_by='time desc',
            limit=10,
            offset=0,
            duration='1h',
            count_only=True
        )
        new_sensors = Sensor.query.filter(Sensor.company_id == company.id).filter(Sensor.deleted == False).filter(Sensor.created_at >= last_hr).count()
        daily_hits = tsdb.get_points_raw(
            DAILY_ANALYTICS_SERIES,
            tags={'company_id': company_id},
            order_by='time desc',
            limit=100,
            offset=0
        )

        return {
            "devices_online": total_sensors - total_sensors_down,
            "alerts_generated": alert_logs['total'],
            "message_received": message_logs['total'],
            "new_devices": new_sensors,
            "daily_hits": daily_hits
        }



class EventLogResource(Resource):
    """Event Log History Resources"""

    method_decorators = [company_required, login_required]

    def get(self, company_id):
        """Get alert trigger history"""
        order_by, order_type, offset, limit, filter = get_filters(in_request=request)

        company = Company.query.filter(Company.uid == company_id).filter(Company.deleted == False).first()
        tags = {"company_id": company.uid}
        if "sensor_id" in filter.keys():
            tags["sensor_id"] = filter["sensor_id"]
        try:
            return tsdb.get_points_raw(EVENT_LOG_SERIES, tags=tags, order_by='time desc', limit=limit, offset=offset)
        except Exception as e:
            _LOGGER.error(e)
            return {'error': 'Server error'}, 500