# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Constants used in App"""

SINGLE_USER = True
TSDB_CLIENT = 'influx'

# Alert Types
ALERT_TYPE_LESS_THEN = 'lt'
ALERT_TYPE_LESS_THEN_EQUAL = 'lte'
ALERT_TYPE_GRATER_THEN = 'gt'
ALERT_TYPE_GRATER_THEN_EQUAL = 'gte'
ALERT_TYPE_EQUAL = 'eq'
ALERT_TYPE_NOT_EQUAL = 'neq'
ALERT_TYPE_INACTIVITY = 'inactivity'
ALERT_TYPE_GEO_FENCING = 'geofencing'
# All alert types
ALERT_TYPES_ALL = [
    ALERT_TYPE_LESS_THEN,
    ALERT_TYPE_LESS_THEN_EQUAL,
    ALERT_TYPE_GRATER_THEN,
    ALERT_TYPE_GRATER_THEN_EQUAL,
    ALERT_TYPE_EQUAL,
    ALERT_TYPE_NOT_EQUAL,
    ALERT_TYPE_INACTIVITY,
    ALERT_TYPE_GEO_FENCING
]
# Common alert types for all sensors
ALERT_TYPES_COMMON = [
    ALERT_TYPE_INACTIVITY,
    ALERT_TYPE_GEO_FENCING
]

EVENT_LOG_SERIES = 'event_logs'
ALERT_HISTORY_SERIES = 'alert_history'
EVENT_HISTORY_SERIES = 'event_history'
DAILY_ANALYTICS_SERIES = 'system_daily_analytics'


# Setting variables

SETTING_SITE_TITLE = 'site_title'
SETTING_SITE_DESCRIPTION = 'site_description'
SETTING_EMAIL_FROM = 'email_from'
SETTING_EMAIL_FROM_NAME = 'email_from_name'
SETTING_SMTP_HOST = 'smtp_host'
SETTING_SMTP_PORT = 'smtp_port'
SETTING_SMTP_USER = 'smtp_username'
SETTING_SMTP_PASSWORD = 'smtp_password'
SETTING_SMTP_USE_SSL = 'smtp_use_ssl'
SETTING_SMTP_USE_TLS = 'smtp_use_tls'
SETTING_EMAIL_BACKEND = 'email_backend'
SETTING_TEMPLATE_FORGOT_PASSWORD = 'template_forgot_password'
SETTING_TEMPLATE_WELCOME = 'template_welcome_email'
SETTING_TEMPLATE_VERIFY_EMAIL = 'template_verify_email'
SETTING_TEMPLATE_INVITE_EMAIL = 'template_invite_email'

SETTING_VERIFY_EMAIL = 'verify_email'

SETTING_SMS_BACKEND = 'sms_backend'
SETTING_SMS_API_KEY= 'sms_api_key'
SETTING_SMS_FROM= 'sms_from'

ROLE_ADMIN = 'admin'
ROLE_READ = 'read'
ROLE_WRITE = 'write'
C_ROLE_DEFAULT = ROLE_READ

ALERT_ACTION_NITIFICATION = 'notification'
ALERT_ACTION_TRIGGER = 'trigger'