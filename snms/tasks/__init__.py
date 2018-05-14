# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from datetime import datetime, timedelta, time
from string import Template
import json
import requests
import pytz

from flask import render_template, render_template_string
from sqlalchemy import or_, and_
from celery.schedules import crontab

from snms.core.celery import celery
from snms.core.logger import Logger
from snms.database import tsdb
from snms.core.db import db
from snms.core.options import options
from snms.modules.sensors import Sensor, SensorType
from snms.modules.alerts import Alert, SensorAlertAssociation, NetworkAlertAssociation, SensorAlertStatus
from snms.modules.companies import Company
from snms.modules.networks import Network, network_sensor_table
from snms.modules.events import Event, SensorEventAssociation, get_next_runtime
from snms.modules.users import User
from snms.core.mail import send_mail
from snms.core.sms import send_sms
from snms.core.mqtt import mqtt
from snms.const import ALERT_TYPE_INACTIVITY, ALERT_TYPE_EQUAL, ALERT_TYPE_GRATER_THEN, \
    ALERT_TYPE_GRATER_THEN_EQUAL, ALERT_TYPE_LESS_THEN, ALERT_TYPE_LESS_THEN_EQUAL, \
    ALERT_TYPE_NOT_EQUAL, ALERT_HISTORY_SERIES, SETTING_EMAIL_FROM, ALERT_ACTION_TRIGGER, \
    EVENT_HISTORY_SERIES, ALERT_TYPE_GEO_FENCING

from .daily import devices_and_calls
from snms.utils.geo import point_in_poly

_LOGGER = Logger.get(__name__)
# TODO: implement CELERY_IGNORE_RESULT to ignore results
# TODO: implement different Queues for tasks. https://denibertovic.com/posts/celery-best-practices/


@celery.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Periodic Tasks
    sender.add_periodic_task(crontab(minute=0), devices_and_calls.s(), name='add_daily_logs')
    sender.add_periodic_task(crontab(), device_status.s(), name='check_device_status')
    sender.add_periodic_task(crontab(), inactivity_alerts_check.s(), name='inactivity_alerts_check')
    sender.add_periodic_task(crontab(), run_schedule_events.s(), name='run_scheduled_events')


def time_in_range(start, end, x):
    """Return true if x is in the range [start, end]"""
    if not start:
        start = time.min
    if not end:
        end = time.max
    if start <= end:
        return start <= x <= end
    else:
        return start <= x or x <= end


@celery.task(name='snms.tasks.device_status', ignore_result=True)
def device_status():
    """Check device status"""
    now = datetime.utcnow()
    _LOGGER.debug("Running device status timeout check")
    sensors = db.session.query(Sensor, SensorType.status_timeout).join(SensorType, Sensor.type == SensorType.type).\
        filter(Sensor.deleted == False).\
        filter(SensorType.status_timeout > 0).all()
    for sensor, timeout in sensors:
        if sensor.last_update is None or (now - sensor.last_update).total_seconds() > float(timeout) * 60:
            sensor.is_down = True
    db.session.flush()
    db.session.commit()


def _get_details(sensor, alert, data=None):
    details = {
        'sensor_name': sensor.name,
        'sensor_type': sensor.type,
        'sensor_id': sensor.uid,
        'sensor_field': alert.field,
        'alert_name': alert.name,
        'alert_id': alert.uid,
        'alert_type': alert.type,
        'alert_compare_value': alert.value,
        'sensor_status': 'Down' if sensor.is_inactive else 'Up',
        'sensor_last_update': sensor.last_update,
        'company_name': sensor.company.name,
        'recipients': alert.recipients,
        'sensor_loc_lat': sensor.location_lat,
        'sensor_loc_lon': sensor.location_long
    }
    if alert.action_type == ALERT_ACTION_TRIGGER:
        details['alert_text'] = "Changing config value"
    else:
        alert_text = render_template_string(alert.alert_text, **details)
        details['alert_text'] = alert_text
    return details


@celery.task(name='snms.tasks.inactivity_alerts_check', ignore_result=True)
def inactivity_alerts_check(sensor_id=None, backup_alert=False, seconds=0):
    """
    Check Inactivity alerts Sensor status.

    This will check for sensor inactivity. All time will be in UTC.
    """
    _LOGGER.debug("Running inactivity alert check")
    now = datetime.utcnow()
    network_alerts_query = db.session.query(Alert, Sensor, SensorAlertStatus).outerjoin(NetworkAlertAssociation).\
        outerjoin(Network, and_(NetworkAlertAssociation.network_id == Network.id, Network.deleted == False)).\
        outerjoin(network_sensor_table, Network.id == network_sensor_table.c.network_id).\
        outerjoin(SensorAlertAssociation, SensorAlertAssociation.alert_id == Alert.id).\
        join(Sensor, or_(Sensor.id == network_sensor_table.c.sensor_id, Sensor.id == SensorAlertAssociation.sensor_id)).\
        outerjoin(SensorAlertStatus, and_(SensorAlertStatus.alert_id == Alert.id, SensorAlertStatus.sensor_id == Sensor.id)).\
        filter(Alert.type == ALERT_TYPE_INACTIVITY).\
        filter(Alert.deleted == False).\
        filter(Sensor.deleted == False).\
        filter(Alert.is_active == True)
    if sensor_id:
        network_alerts_query = network_alerts_query.filter(Sensor.id == sensor_id)
    network_alerts = network_alerts_query.all()
    for alert, sensor, status in network_alerts:
        if not time_in_range(alert.between_start, alert.between_end, now.time()) and backup_alert:
            continue
        if not time_in_range(sensor.time_start, sensor.time_end, now.time()):
            continue

        # if status is None or status.last_execute is None or (now - status.last_execute).total_seconds() > alert.snooze * 60:
        if status is None or status.last_execute is None or status.last_execute < sensor.last_update or backup_alert:
            if sensor.last_update is None or (now - sensor.last_update).total_seconds() > float(alert.value) * 60 or backup_alert:
                _LOGGER.debug("-------------------Alert Send------------------")
                if not backup_alert:
                    if status is None:
                        status = SensorAlertStatus(sensor_id=sensor.id, alert_id=alert.id)
                    status.last_execute = now
                    sensor.is_inactive = True
                    db.session.add(sensor)
                    db.session.add(status)
                    db.session.commit()
                try:
                    alert_details = _get_details(sensor, alert)
                except Exception as e:
                    _LOGGER.error(e)
                    continue
                send_alerts.delay(alert_details, alert.web_hooks)
                add_alert_history(sensor.company.uid, sensor.uid, alert.uid, alert_details)
        else:
            _LOGGER.debug("--- Alert Snooze ---")


def is_alert_triggered(alert_details, current_data, alert=None):
    """Check if the alert is triggered."""
    alert_type = alert_details["alert_type"]
    if alert_type == ALERT_TYPE_GEO_FENCING:
        is_in = point_in_poly(alert_details['sensor_loc_lat'], alert_details['sensor_loc_lon'], alert.polygon)
        if is_in and alert.alert_if == "inside":
            return True
        if not is_in and alert.alert_if != "inside":
            return True
        return False
    threshold = float(alert_details["alert_compare_value"])
    current_value = float(current_data[alert_details["sensor_field"]])
    if alert_type == ALERT_TYPE_LESS_THEN:
        return current_value < threshold
    if alert_type == ALERT_TYPE_GRATER_THEN:
        return current_value > threshold
    if alert_type == ALERT_TYPE_LESS_THEN_EQUAL:
        return current_value <= threshold
    if alert_type == ALERT_TYPE_GRATER_THEN_EQUAL:
        return current_value >= threshold
    if alert_type == ALERT_TYPE_EQUAL:
        return current_value == threshold
    if alert_type == ALERT_TYPE_NOT_EQUAL:
        return current_value != threshold
    return False


def add_alert_history(company_id, sensor_id, alert_id, alert_details):
    tsdb.add_series(
                    ALERT_HISTORY_SERIES,
                    {
                        "company_id": company_id,
                        "sensor_id": sensor_id,
                        'alert_id': alert_id
                    },
                    {
                        'alert_text': alert_details['alert_text'],
                        'alert_name': alert_details['alert_name'],
                        'sensor_name': alert_details['sensor_name'],
                    }
                )


def add_event_history(company_id, sensor_id, event_id, event_details):
    tsdb.add_series(
                    EVENT_HISTORY_SERIES,
                    {
                        "company_id": company_id,
                        "sensor_id": sensor_id,
                        'event_id': event_id
                    },
                    {
                        'event_name': event_details['event_name'],
                        'sensor_name': event_details['sensor_name'],
                    }
                )


@celery.task(name='snms.tasks.process_alert', ignore_result=True)
def process_alert(sensor_id, data):
    """
    Process the alerts for the sensor based on the current sensor values.

    :param sensor_id: Sensor ID
    :param data: Current Values
    """
    _LOGGER.debug("Processing Alert")
    now = datetime.utcnow()
    sensor = Sensor.query.get(sensor_id)
    network_alerts = db.session.query(Alert, Sensor, SensorAlertStatus, SensorAlertAssociation).outerjoin(NetworkAlertAssociation).\
        outerjoin(Network, and_(NetworkAlertAssociation.network_id == Network.id, Network.deleted == False)).\
        outerjoin(network_sensor_table, Network.id == network_sensor_table.c.network_id).\
        outerjoin(SensorAlertAssociation, SensorAlertAssociation.alert_id == Alert.id).\
        join(Sensor, or_(Sensor.id == network_sensor_table.c.sensor_id, Sensor.id == SensorAlertAssociation.sensor_id)).\
        outerjoin(SensorAlertStatus, and_(SensorAlertStatus.alert_id == Alert.id, SensorAlertStatus.sensor_id == Sensor.id)).\
        filter(Sensor.id == sensor_id).\
        filter(Alert.deleted == False).\
        filter(Alert.is_active == True).all()
    for alert, s, status, sa in network_alerts:
        if not time_in_range(alert.between_start, alert.between_end, now.time()):
            continue

        if alert.type not in [
            ALERT_TYPE_LESS_THEN,
            ALERT_TYPE_GRATER_THEN,
            ALERT_TYPE_LESS_THEN_EQUAL,
            ALERT_TYPE_GRATER_THEN_EQUAL,
            ALERT_TYPE_EQUAL, ALERT_TYPE_NOT_EQUAL,
            ALERT_TYPE_GEO_FENCING
        ]:
            continue

        alert_details = _get_details(sensor, alert)
        if alert.type == ALERT_TYPE_GEO_FENCING:
            alert_details['current_value'] = None
        else:
            alert_details['current_value'] = float(data[alert.field])

        if status is None or status.last_execute is None or (now - status.last_execute).total_seconds() > alert.snooze * 60:
            if is_alert_triggered(alert_details, data, alert):
                _LOGGER.debug("-------------------Alert Send------------------")
                if status is None:
                    status = SensorAlertStatus(sensor_id=sensor.id, alert_id=alert.id)
                status.last_execute = now
                db.session.add(status)
                db.session.commit()
                if alert.action_type == ALERT_ACTION_TRIGGER:
                    if sa and sa.actuator_id:
                        actuator = Sensor.query.get(sa.actuator_id)
                        if actuator:
                            conf = dict(actuator.config)
                            conf[alert.config_field] = alert.config_value
                            actuator.config = conf
                            actuator.config_updated = datetime.utcnow()
                            db.session.add(actuator)
                            _LOGGER.info(actuator.config)
                            db.session.commit()
                            mqtt.publish('sensors/{}/configuration'.format(actuator.uid), json.dumps(conf))
                            # _LOGGER.info("Set field %s of %s with value %s" % (alert.config_field, actuator.name, alert.config_value))
                        else:
                            _LOGGER.error("Actuator not found")
                        # _LOGGER.info("Trigger alert")
                else:
                    send_alerts.delay(alert_details, alert.web_hooks)
                add_alert_history(sensor.company.uid, sensor.uid, alert.uid, alert_details)
            else:
                _LOGGER.debug("Alert not triggered")
        else:
            _LOGGER.debug("--- Alert Snooze ---")


@celery.task(name='snms.tasks.send_alert', ignore_result=True)
def send_alerts(alert_data, web_hooks=None):
    """Send the alerts to users"""
    emails = alert_data["recipients"]
    phones = []
    users = User.query.filter(User.email.in_(emails)).filter(User.deleted == False).all()
    for user in users:
        if user.phone is not None:
            phones.append(user.phone)
    if len(emails) > 0:
        send_email.delay('Alert: '+alert_data['alert_name'], alert_data['alert_text'], emails,
                         html_message=alert_data['alert_text'])
    if len(phones) > 0:
        send_text.delay(alert_data['alert_text'], phones)
    if web_hooks is not None:
        for web_hook in web_hooks:
            web_hook['url'] = Template(web_hook['url']).safe_substitute(alert_data)
            try:
                payload = {p['key']: p['value'] for p in web_hook["payload"]}
                for k, v in payload.items():
                    payload[k] = Template(v).safe_substitute(alert_data)
            except Exception as e:
                _LOGGER.error(e)
                payload = {}
            call_web_hook.delay(web_hook['url'], payload)


@celery.task(name='snms.tasks.send_email', ignore_result=True)
def send_email(subject, message, recipient_list, from_email=None, **kwargs):
    """
    Send an email.

    :param from_email: Sender Email
    :param subject: Subject of Email
    :param message: Message
    :param recipient_list: Email Recipients
    """
    _LOGGER.debug("Sending email to : {}".format(', '.join(recipient_list)))
    if not from_email:
        from_email = options.option[SETTING_EMAIL_FROM]
    send_mail(subject, message, from_email, recipient_list, **kwargs)


@celery.task(name='snms.tasks.send_text', ignore_result=True)
def send_text(message, recipient_list):
    """
    Send a text message.

    :param message: Message
    :param recipient_list: Text Recipients
    """
    # TODO: Implement text messaging.
    _LOGGER.debug("Sending Text Alert: %s", message)
    for recipient in recipient_list:
        send_sms(recipient, message)


@celery.task(name='snms.tasks.call_web_hook', ignore_result=True)
def call_web_hook(url, data, method='POST', headers=None):
    """
    Call a web-hook

    :param url: URL to call
    :param data: Data to be send as POST request body
    :param method: HTTP Method, GET or POST
    :param headers: Request Headers
    """
    try:
        if not headers:
            headers = {
                'content-type': "application/json"
            }
        r = requests.request(method, url, data=json.dumps(data), headers=headers)
        _LOGGER.debug(r.text)
    except Exception as e:
        _LOGGER.error(e)


@celery.task(name='snms.task.run_scheduled_events', ignore_result=True)
def run_schedule_events():
    _LOGGER.debug("Running scheduled tasks check")
    now = datetime.utcnow()
    now = now.replace(second=0, microsecond=0)
    _LOGGER.debug(now)
    events_query = db.session.query(Event, Sensor).\
        outerjoin(SensorEventAssociation, SensorEventAssociation.event_id == Event.id).\
        outerjoin(Sensor, Sensor.id == SensorEventAssociation.sensor_id).\
        filter(Event.next_runtime == now).\
        filter(Event.deleted_at == None).\
        filter(Event.is_active == True).all()
    for event, actuator in events_query:
        if actuator and not actuator.deleted:
            conf = dict(actuator.config)
            conf[event.config_field] = event.config_value
            actuator.config = conf
            actuator.config_updated = datetime.utcnow()
            db.session.add(actuator)
            mqtt.publish('sensors/{}/configuration'.format(actuator.uid), json.dumps(conf))

            add_event_history(actuator.company.uid, actuator.uid, event.id,
                              {
                                  "event_name": event.name, "sensor_name": actuator.name
                              })
        if event.repeat:
            event.next_runtime = get_next_runtime(event.start_date, event.repeat, event.unit)
            db.session.add(event)
    db.session.commit()
