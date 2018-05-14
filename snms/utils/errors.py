"""Custom Error Messages"""
from flask_restful import HTTPException


class UserAlreadyExistsError(HTTPException):
    pass


class ResourceDoesNotExist(HTTPException):
    code = 404


error_messages = {
    'UserAlreadyExistsError': {
        'message': "A user with that email already exists.",
        'status': 409,
    },
}