# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

import json
import datetime
from flask import current_app
from snms.core.logger import Logger
from snms.core.mqtt import mqtt, MQTT_LOG_DEBUG
from snms.core.mqtt.consumer import EmqpConsumer
from snms.core.config import config
from snms.modules.sensors.controllers import post_sensor_value_with_uid

_LOGGER = Logger.get(__name__)

USE_RABBITMQ = True


def mqtt_cmd(args):
    if USE_RABBITMQ:
        host = config.MQTT_BROKER_URL
        username = config.MQTT_USERNAME
        password = config.MQTT_PASSWORD
        amqp_url = "amqp://{}:{}@{}:5672".format(username, password, host)
        consumer = EmqpConsumer(amqp_url, mqtt.app)
        consumer.run()
        return
    else:
        # mqtt.init_app(current_app)
        _LOGGER.debug("Starting MQTT Command . . . . . .")
        mqtt.subscribe('sensors/+/values')

        @mqtt.on_log()
        def handle_logging(client, userdata, level, buf):
            if level >= MQTT_LOG_DEBUG:
                _LOGGER.debug('MQTT: {}'.format(buf))

        @mqtt.on_subscribe()
        def on_subscribe(client, userdata, mid, granted_qos):
            _LOGGER.debug("Subscribe Callback")
            _LOGGER.debug(granted_qos)

        @mqtt.on_message()
        def handle_topic(client, userdata, message):
            topic = message.topic
            sensor_uid = topic.split("/")[1]
            _LOGGER.debug("Sensor UID : {}".format(sensor_uid))
            data = None
            try:
                data = json.loads(str(message.payload.decode('utf-8')))
                _LOGGER.debug(data)
                if 'fromServer' not in data.keys():
                    post_sensor_value_with_uid(sensor_uid, data, datetime.datetime.now(datetime.timezone.utc), from_mqtt=True)
            except Exception as e:
                _LOGGER.error(e)

        mqtt.client.loop_forever()