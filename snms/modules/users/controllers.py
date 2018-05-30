# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from __future__ import unicode_literals

"""User Resources."""
from flask import g, request
from flask_restful import Resource, reqparse
from werkzeug.security import generate_password_hash
from sqlalchemy.exc import IntegrityError

from snms.models import add_event_log
from snms.core.db import db
from snms.utils import get_filters
from snms.modules.users import User, UserMetaData, logger
from snms.common.auth import login_required, admin_required, create_token
from snms.common.schemas import AddUserSchema
from snms.utils.crypto import generate_uid


class UserListResource(Resource):
    """
    User list resources

    Get users
    Add new user
    """
    method_decorators = [admin_required, login_required]

    def get(self):
        """
        Get all users

        :endpoint: ``/users``
        :method: ``GET``

        :return: Users List

        Example Response::

            {
                "data": [
                    {
                        "id": 1,
                        "name": "Gopal",
                        "email": "gopal.kildoliya@baseapp.com",
                        "phone": "987654321",
                        "role": "user"
                    },
                    .
                    .
                    .
                ],
                "total": 15
            }


        """
        order_by, order_type, offset, limit, filter = get_filters(in_request=request)
        users = User.query.filter(User.deleted == False).order_by(db.text(order_by + " " + order_type))
        if 'q' in filter.keys():
            users = users.filter(User.name.ilike("%{}%".format(filter['q'])))
        # TODO: Add filter on results.
        return {
            "data": [{
                'id': user.uid,
                'name': user.name,
                'email': user.email,
                'phone': user.phone,
                'role': user.role,
                'is_verified': user.is_verified
                } for user in users[offset:offset+limit]],
            "total": users.count()
        }

    def post(self):
        """
        Add new User

        :endpoint: ``/users``
        :method: ``POST``
        """
        args, errors = AddUserSchema().load(request.get_json())
        if errors:
            return errors, 422
        user = User(name=args['name'], email=args['email'], uid=generate_uid(),
                    password=generate_password_hash(args['password']),
                    role=args['role'], phone=args['phone'], is_verified=True)

        try:
            db.session.add(user)
            db.session.commit()
            uid = user.uid
            db.session.close()
            # TODO: Send Email on user registration.
            add_event_log(user_id=user.uid, log="User Added: {}".format(user.name))
            return {'id': uid}
        except IntegrityError as e:
            logger.error(e)
            return {'message': 'User with email already exists.', 'code': 409}, 409
        except Exception as e:
            logger.error(e)
            db.session.rollback()
            db.session.close()
            return {'message': 'Internal server error', 'code': 500}, 500


class UserResource(Resource):
    """User list resources"""
    method_decorators = [admin_required, login_required]

    def get(self, user_id):
        """
        Get a user by ID

        :endpoint: ``/users/<user_id>``
        :method: ``GET``

        :param user_id: User ID
        :return:
        """
        user = User.query.filter(User.uid == user_id).filter(User.deleted == False).first()
        if user is None:
            return {'message': 'User not found', 'code': 404}, 404
        return {
            'id': user.uid,
            'name': user.name,
            'email': user.email,
            'phone': user.phone,
            'role': user.role,
            'is_verified': user.is_verified
        }

    def put(self, user_id):
        """
        Update User


        :endpoint: ``/users/<user_id>``
        :method: ``PUT``

        """
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=True, help="Name is required")
        # Can't change email
        parser.add_argument('password', type=str)
        parser.add_argument('phone', type=str)
        parser.add_argument('role', type=str)
        # TODO: Change error format for argument parser.
        args = parser.parse_args()
        user = User.query.filter(User.uid == user_id).filter(User.deleted == False).first()
        if user is None:
            return {'message': 'User not found', 'code': 404}, 404
        user.name = args['name']
        user.phone = args['phone']
        if args['password']:
            user.password = generate_password_hash(args['password'])
        if args['role']:
            user.role = args['role']
        try:
            # session.add(user)
            db.session.commit()
            uid = user.uid
            db.session.close()
            return {'id': uid}
        except Exception as e:
            logger.error(e)
            db.session.rollback()
            db.session.close()
            return {'message': 'Internal server error', 'code': 500}, 500

    def delete(self, user_id):
        """
        Delete user from database.


        :endpoint: ``/users/<user_id>``
        :method: ``DELETE``
        """
        user = User.query.filter(User.uid == user_id).filter(User.deleted == False).first()
        if user is None:
            return {'message': 'User not found', 'code': 404}, 404
        user.deleted = True
        db.session.add(user)
        db.session.commit()
        add_event_log(user_id=user.uid, log="User Deleted: {}".format(user.name))
        return {'message': 'User deleted', 'code': 200}, 200


class CurrentUserResource(Resource):
    """Current User Resource"""
    method_decorators = [login_required]

    def get(self):
        """Get current user details"""
        user = g.get('user', None)
        return {
            'id': user.uid,
            'name': user.name,
            'email': user.email,
            'phone': user.phone,
            'role': user.role,
            'is_verified': user.is_verified
                }, 200

    def post(self):
        """Update current user details"""
        user = g.get('user', None)
        if user is None:
            return {'message': 'User not found', 'code': 404}, 404

        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=True, help="Name is required")
        # Can't change email
        parser.add_argument('password', type=str)
        parser.add_argument('phone', type=str)
        args = parser.parse_args()

        user.name = args['name']
        user.phone = args['phone']
        if args['password']:
            user.password = generate_password_hash(args['password'])
        try:
            # session.add(user)
            db.session.commit()
            uid = user.uid
            db.session.close()
            return {'id': uid}
        except Exception as e:
            logger.error(e)
            db.session.rollback()
            db.session.close()
            return {'message': 'Internal server error', 'code': 500}, 500


class UserMetaResource(Resource):
    """
    User meta resource

    Endpoints::

        GET: /me/meta_data
        POST: /me/meta_data

    """

    method_decorators = [login_required]

    def get(self, user_id=None):
        """
        Get user meta

        Example Response::

            {
              "data": [
                  {
                    "key" : "current_company_id",
                    "value" : 1,
                    "id" : 1
                  }
                ],
              "total": 1
            }

        :param user_id User ID
        :type user_id: str
        """
        user = g.get('user', None)
        if user is None:
            return {'message': 'User not found', 'code': 404}, 404
        meta_data = UserMetaData.query.filter(UserMetaData.user_id == user.id)
        return {
            "data": [{
                'id': meta.id,
                'key': meta.key,
                'value': meta.value
                } for meta in meta_data],
            "total": meta_data.count()
        }

    def post(self):
        """Add user meta"""
        json_data = request.get_json()
        user = g.get('user', None)
        if user is None:
            return {'message': 'User not found', 'code': 404}, 404
        try:
            r = UserMetaData.query.filter(UserMetaData.user_id == user.id).filter(UserMetaData.key == json_data['key']).update({"value": json_data['value']})
            if r < 1:
                # Create a new Entry
                new_data = UserMetaData(user_id=user.id, key=json_data['key'], value=json_data['value'])
                db.session.add(new_data)
            db.session.commit()
            return json_data, 200
        except Exception as e:
            logger.error(e)
            db.session.rollback()
            return {}, 500


class UserAccessResource(Resource):
    """Get Access token for user"""

    method_decorators = [admin_required, login_required]

    def get(self, user_id):
        user = User.query.filter(User.uid == user_id).filter(User.deleted == False).first()
        if user is None:
            return {'message': 'User not found', 'code': 404}, 404
        return {'token': create_token(user)}