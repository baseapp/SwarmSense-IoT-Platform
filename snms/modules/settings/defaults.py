# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Default Options"""
from snms import const

default_options = [
    {
        'label': 'Site Title',
        'key': const.SETTING_SITE_TITLE,
        'value': 'SwarmSense',
        'access': 'public',
        'type': 'text',
        'group': 'site'
    },
    {
        'label': 'Site Description',
        'key': const.SETTING_SITE_DESCRIPTION,
        'value': 'SwarmSense IoT',
        'access': 'public',
        'type': 'text',
        'group': 'site'
    },
    {
        'label': 'Default Email From',
        'key': const.SETTING_EMAIL_FROM,
        'value': 'swarmsense@baseapp.com',
        'access': 'public',
        'type': 'text',
        'group': 'email'
    },
    {
        'label': 'Email From Name',
        'key': const.SETTING_EMAIL_FROM_NAME,
        'value': 'SwarmSense Support',
        'access': 'public',
        'type': 'text',
        'group': 'email'
    },
    {
        'label': 'SMTP Host',
        'key': const.SETTING_SMTP_HOST,
        'value': 'localhost',
        'access': 'private',
        'type': 'text',
        'group': 'email'
    },
    {
        'label': 'SMTP Port',
        'key': const.SETTING_SMTP_PORT,
        'value': 25,
        'access': 'private',
        'type': 'int',
        'group': 'email'
    },
    {
        'label': 'SMTP Username',
        'key': const.SETTING_SMTP_USER,
        'value': None,
        'access': 'private',
        'type': 'text',
        'group': 'email'
    },
    {
        'label': 'SMTP Password',
        'key': const.SETTING_SMTP_PASSWORD,
        'value': None,
        'access': 'private',
        'type': 'text',
        'group': 'email'
    },
    {
        'label': 'SMTP Use SSL',
        'key': const.SETTING_SMTP_USE_SSL,
        'value': False,
        'access': 'private',
        'type': 'boolean',
        'group': 'email'
    },
    {
        'label': 'SMTP Use TLS',
        'key': const.SETTING_SMTP_USE_TLS,
        'value': False,
        'access': 'private',
        'type': 'boolean',
        'group': 'email'
    },
    {
        'label': 'Email Backend',
        'key': const.SETTING_EMAIL_BACKEND,
        'value': 'smtp',
        'access': 'public',
        'type': 'text',
        'options': ['smtp'],
        'group': 'email'
    },
    {
        'label': 'Forgot Password Email Template',
        'key': const.SETTING_TEMPLATE_FORGOT_PASSWORD,
        'value': 'Hello {{ name }}, Please use the following code to reset the password. Code: {{ reset_code }}. Thanks {{ setting_site_title }}',
        'access': 'private',
        'type': 'text',
        'group': 'email'
    },
    {
        'label': 'Welcome Email Template',
        'key': const.SETTING_TEMPLATE_WELCOME,
        'value': 'Hello {{ name }}, Welcome to {{ site_title }}',
        'access': 'private',
        'type': 'text',
        'group': 'email'
    },
    {
        'label': 'Email Verification Template',
        'key': const.SETTING_TEMPLATE_VERIFY_EMAIL,
        'value': 'Welcome {{ name }} ! Please verify your email using following code {{ verification_code}}',
        'access': 'private',
        'type': 'text',
        'group': 'email'
    },
    {
        'label': 'User Invite Template',
        'key': const.SETTING_TEMPLATE_INVITE_EMAIL,
        'value': 'Hi {{ email }} ! You are invited to join {{ company_name }} at {{ setting_site_title }}. Please use following link to sign up. {{ setting_base_url }}',
        'access': 'private',
        'type': 'text',
        'group': 'email'
    },
    {
        'label': 'SMS Backend',
        'key': const.SETTING_SMS_BACKEND,
        'value': 'textlocal',
        'access': 'private',
        'type': 'text',
        'options': ['textlocal'],
        'group': 'sms'
    },
    {
        'label': 'SMS API Key',
        'key': const.SETTING_SMS_API_KEY,
        'value': '',
        'access': 'private',
        'type': 'text',
        'group': 'sms'
    },
    {
        'label': 'SMS Sender',
        'key': const.SETTING_SMS_FROM,
        'value': 'SWARMS',
        'access': 'private',
        'type': 'text',
        'group': 'sms'
    },
    {
        'label': 'Verify Email',
        'key': const.SETTING_VERIFY_EMAIL,
        'value': False,
        'access': 'private',
        'type': 'boolean',
        'group': 'email'
    },
]


def get_default_settings():
    return {v['key']: v['value'] for v in default_options}



