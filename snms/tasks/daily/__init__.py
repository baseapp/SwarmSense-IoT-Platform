# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Daily running Tasks"""
import datetime
from celery import shared_task
from sqlalchemy import func

from snms.const import DAILY_ANALYTICS_SERIES
from snms.database import tsdb
from snms.core.db import db
from snms.modules.companies import Company
from snms.modules.sensors import Sensor
from snms.modules.sensors import get_all_types
from snms.core.logger import Logger

_LOGGER = Logger.get()


@shared_task(name='snms.tasks.daily.devices_and_calls')
def devices_and_calls():
    _LOGGER.debug("Running devices_and_calls task")
    now = datetime.datetime.utcnow()
    now = now.replace(minute=0, microsecond=0)
    last_day = now - datetime.timedelta(minutes=1)
    last_day = last_day.replace(hour=0, minute=0, second=0, microsecond=0)
    companies = Company.query.filter(Company.deleted == False).all()
    total_sensors = db.session.query(func.count(Sensor.id), Sensor.company_id).filter(Sensor.last_update >= last_day).group_by(Sensor.company_id).all()

    all_types = get_all_types()
    all_measurements = list(all_types.keys())

    for company in companies:
        active_sensors = [x[0] for x in total_sensors if x[1] == company.id]
        if len(active_sensors) == 0:
            active_sensors = [0]
        for count in active_sensors:
            message_count = 0
            if len(all_measurements) > 0:
                for measurment in all_measurements:
                    try:
                        message_logs = tsdb.get_points_raw(measurment, tags={'company_id': company.id}, order_by='time desc', limit=10, offset=0, start_date=last_day.strftime("%Y-%m-%d %H:%M:%S"), count_only=True)
                        message_count += message_logs['total']
                    except Exception as e:
                        _LOGGER.error(e)
            _LOGGER.info("{} :-----------: {} :-------------: {}".format(company.name, count, message_count))
            tsdb.add_series(
                    DAILY_ANALYTICS_SERIES,
                    {
                        "company_id": company.uid,
                        'period': 'daily'
                    },
                    {
                        'message_count': message_count,
                        'active_sensors': count
                    },
                    time=last_day.isoformat()
                )