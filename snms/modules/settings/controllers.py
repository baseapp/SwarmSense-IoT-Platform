# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Settings Resources."""
from flask import g, request
from flask_restful import Resource, reqparse
from sqlalchemy.exc import IntegrityError
from sqlalchemy import asc

from snms.core.db import db
from snms.core.logger import Logger
from snms.common.auth import login_required, admin_required
from snms.modules.settings import Setting
from snms.common.schemas import AddSettingSchema
from snms.core.signals.core import settings_changed
from snms.utils import get_filters


_LOGGER = Logger.get()


class SettingListResource(Resource):
    """Settings list resources"""
    method_decorators = [admin_required, login_required]

    def get(self):
        order_by, order_type, offset, limit, filter = get_filters(in_request=request)
        order_query = Setting.order
        if order_by in ['group', 'access', 'id', 'label', 'order']:
            order_query = db.text('"{}" {}'.format(order_by, order_type))
        settings = Setting.query.order_by(order_query).all()
        # TODO: Add filter on results.
        return AddSettingSchema(many=True).dump(settings).data

    def post(self):
        """Add new Setting"""
        args, errors = AddSettingSchema().load(request.get_json())
        if errors:
            return errors, 422
        setting = Setting(**args)

        try:
            db.session.add(setting)
            db.session.commit()
            id = setting.id
            db.session.close()
            settings_changed.send(setting)
            return {'id': id}
        except IntegrityError as e:
            _LOGGER.error(e)
            return {'message': 'Setting with key already exists.', 'code': 409}, 409
        except Exception as e:
            _LOGGER.error(e)
            db.session.rollback()
            db.session.close()
            return {'message': 'Internal server error', 'code': 500}, 500


class SettingResource(Resource):
    """Setting list resources"""
    method_decorators = [admin_required, login_required]

    def get(self, setting_id):
        setting = Setting.query.filter(Setting.id == setting_id).first()
        if setting is None:
            return {'message': 'Setting not found', 'code': 404}, 404
        return AddSettingSchema().dump(setting)

    def put(self, setting_id):
        """Update Settings"""
        args, errors = AddSettingSchema(partial=True).load(request.get_json())
        if errors:
            return errors, 422
        try:
            setting = Setting.query.filter(Setting.id == setting_id).update(args)
            db.session.commit()
            settings_changed.send(setting)
            return {'status': setting}
        except Exception as e:
            _LOGGER.error(e)
            return {'message': 'Internal Server Error', 'code': 500}, 500

    def delete(self, setting_id):
        """Delete setting from database."""
        setting = Setting.query.get(setting_id)
        if setting is None:
            return {'message': 'Setting not found', 'code': 404}, 404
        db.session.delete(setting)
        db.session.commit()
        # TODO: Remove setting on delete
        return {'message': 'Setting deleted', 'code': 200}, 200


class AllSettingsResource(Resource):
    """All Settings Resource"""

    def get(self):
        """Get all the settings"""
        settings = Setting.query.filter(Setting.access == 'public').all()
        return {setting.key: setting.value for setting in settings}
