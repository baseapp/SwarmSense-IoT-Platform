# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Auth model."""
from functools import wraps
from datetime import datetime, timedelta
from flask import jsonify, request, g
import jwt
from jwt import DecodeError, ExpiredSignature
from werkzeug.exceptions import Unauthorized, Forbidden

from snms.modules.users import User
from flask import current_app as app


def create_token(user):
    """Create a token for user."""

    payload = {
        # subject
        'sub': user.id,
        # issued at
        'iat': datetime.utcnow(),
        # expiry
        'exp': datetime.utcnow() + timedelta(days=30)
    }

    token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')
    return token.decode('unicode_escape')


def parse_token(req):
    """Parse token from incoming request."""
    try:
        token = req.headers.get('Authorization').split()[1]
    except IndexError:
        return None
    return jwt.decode(token, app.config['SECRET_KEY'], algorithms='HS256')


def login_required(f):
    """
    Requires user authentication information to be supplied as a JWT.

    Decorator function for Flask requests. If the JWT can be decoded successfully, ``flask.g.user`` will be set with the
    JWT payload.

    :param f: function or method to be decorated
    :return: decorated function
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.headers.get('Authorization'):
            raise Unauthorized('Missing authorization header')
        try:
            payload = parse_token(request)
        except DecodeError:
            raise Unauthorized('Token is invalid')
        except ExpiredSignature:
            raise Unauthorized('Token has expired')
        # TODO: invalid token error handling.
        if payload is None:
            raise Unauthorized('Token is invalid')
        g.user_id = payload['sub']
        user_query = User.query.filter(User.id == g.user_id).filter(User.deleted == False)
        user = user_query.first()
        if user is None:
            raise Forbidden('Unauthorized access')

        g.user = user
        return f(*args, **kwargs)
    return decorated_function


def admin_required(f):
    """
    Decorator to check is user is super admin

    :param f: function or method to be decorated
    :return: decorated function
    """

    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = g.user
        if user:
            if user.is_super_admin():
                return f(*args, **kwargs)
            else:
                raise Forbidden('Unauthorized access')
        else:
            raise Forbidden('Unauthorized access')
    return decorated_function
