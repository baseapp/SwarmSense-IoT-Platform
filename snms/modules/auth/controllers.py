# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""User Resources."""
from flask import request, render_template_string
from flask_restful import Resource, reqparse
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.exc import IntegrityError

from snms.core.db import db
from snms.modules.users import User
from snms.modules.companies import Company, UserInvite, CompanyUserAssociation
from snms.common.auth import create_token
from snms.common.schemas import EmailSchema, SignupSchema, PasswordResetSchema
from snms.tasks import send_email
from snms.core.logger import Logger
from snms.utils import crypto
from snms.const import SETTING_TEMPLATE_FORGOT_PASSWORD, SETTING_TEMPLATE_WELCOME, \
    SETTING_TEMPLATE_VERIFY_EMAIL, ROLE_ADMIN, SETTING_VERIFY_EMAIL
from snms.core.options import options

_LOGGER = Logger.get()


def _send_welcome_email(user):
    """Send Welcome email to user"""
    message = render_template_string(
        options.option[SETTING_TEMPLATE_WELCOME],
        name=user.name,
        email=user.email,
        id=user.uid
    )
    send_email.delay("Welcome", message, [user.email])


def _send_verification_email(user):
    """Send verification email to user"""
    message = render_template_string(
        options.option[SETTING_TEMPLATE_VERIFY_EMAIL],
        name=user.name,
        email=user.email,
        id=user.uid,
        verification_code=user.verification_code
    )
    send_email.delay("Verify Email", message, [user.email])


def _send_password_reset_email(user):
    """Send Password reset email to user"""
    message = render_template_string(
        options.option[SETTING_TEMPLATE_FORGOT_PASSWORD],
        name=user.name,
        email=user.email,
        id=user.uid,
        reset_code=user.reset_code
    )
    send_email.delay("Reset Password",
                     message,
                     [user.email],
                     html_message=message
                     )


class LoginResource(Resource):
    """User login resource."""

    parser = reqparse.RequestParser()
    parser.add_argument('email', type=str, required=True, help="Email is required")
    parser.add_argument('password', type=str, required=True, help="Password is required")

    def post(self):
        """User Login"""
        args = self.parser.parse_args()
        try:
            user_query = db.session.query(User).filter(User.email == args['email']).filter(User.deleted == False)
            user = user_query.first()
            if user:
                if check_password_hash(user.password, args['password']):
                    if user.is_verified:
                        return {'token': create_token(user)}
                    else:
                        return {'message': 'Email address not verified. Please verify your email first.', 'code': 401}, 401
                else:
                    return {'message': 'Invalid email password', 'code': 401}, 401
            else:
                return {'message': 'Invalid email password', 'code': 401}, 401
        except Exception as e:
            _LOGGER.error(e)
            return {'message': 'Internal server error', 'code': 500}, 500


class SignupResource(Resource):
    """User signup resource."""

    def post(self):
        """Add User"""
        # args = self.parser.parse_args()
        args, errors = SignupSchema().load(request.get_json())
        if errors:
            return errors, 422
        is_verified = True
        if options.option[SETTING_VERIFY_EMAIL]:
            is_verified = False
        user = User(
            uid=crypto.generate_uid(),
            name=args['name'],
            email=args['email'],
            password=generate_password_hash(args['password']),
            verification_code=crypto.get_random_string(length=12),
            is_verified=is_verified
        )

        try:
            company = Company(name=args['company_name'], uid=crypto.generate_uid(), key=crypto.generate_key())
            user_company = CompanyUserAssociation(role=ROLE_ADMIN)
            user_company.user = user
            company.users.append(user_company)
            user.own_companies.append(company)
            db.session.add(company)
            db.session.add(user)
            db.session.commit()
            uid = user.uid

            invitations = UserInvite.query.filter(UserInvite.email == user.email).all()
            for invitation in invitations:
                company = Company.query.filter(Company.id == invitation.company_id).filter(
                    Company.deleted == False).first()
                if company:
                    user_company = CompanyUserAssociation(role=invitation.role)
                    user_company.company = company
                    user.companies.append(user_company)
            db.session.add(user)
            db.session.commit()

            if not is_verified:
                _send_verification_email(user)
            else:
                _send_welcome_email(user)

            db.session.close()
            return {'id': uid}
        except IntegrityError as e:
            _LOGGER.error(e)
            return {'message': 'User with email already exists.', 'code': 409}, 409
        except Exception as e:
            _LOGGER.error(e)
            db.session.rollback()
            db.session.close()
            return {'message': 'Internal server error', 'code': 500}, 500


class ForgotPassword(Resource):
    """Forgot password resource."""

    def post(self):
        # parser = reqparse.RequestParser()
        # parser.add_argument("email", type=str, required=True, help="Email is required")
        # args = parser.parse_args()
        args, errors = EmailSchema().load(request.get_json())
        if errors:
            return errors, 422
        user = User.query.filter(User.email == args['email']).filter(User.deleted == False).first()
        if user:
            user.reset_password = True
            user.reset_code = crypto.get_random_string(length=12)
            db.session.add(user)
            db.session.commit()
            _send_password_reset_email(user)
            return {"message": "Check your email for password reset link"}
        else:
            return {"message": "No account exists with the given email."}, 401


class ResetPassword(Resource):
    """Reset password resource"""

    def post(self):
        """Reset the password"""

        args, errors = PasswordResetSchema().load(request.get_json())
        if errors:
            return errors, 422
        user = User.query.filter(User.email == args['email']).filter(User.deleted == False).first()
        is_verified = user.is_verified
        if user:
            if user.reset_code == args['code']:
                user.reset_password = False
                user.password = generate_password_hash(args['password'])
                user.reset_code = ""
                user.is_verified = True
                user.verification_code = None
                db.session.add(user)
                db.session.commit()
                if not is_verified:
                    _send_welcome_email(user)
                return {"message": "Password changed, please login."}, 200
            else:
                return {"message": "Invalid reset code"}, 401
        else:
            return {"message": "No account exists with the given email."}, 401


class EmailVerifyResource(Resource):
    """Email verification resources"""

    def _verify(self, email, code):
        """Verify User and send Email"""
        user = User.query.filter(User.email == email).filter(User.deleted == False).first()
        if user:
            if user.is_verified:
                return {"message": "Already Verified."}, 200
            if user.verification_code == code:
                user.is_verified = True
                user.verification_code = None
                db.session.add(user)
                db.session.commit()
                _send_welcome_email(user)
                return {"message": "Verified, please login."}, 200
            else:
                return {"message": "Invalid reset code"}, 401
        else:
            return {"message": "No account exists with the given email."}, 401

    def post(self):
        args, errors = PasswordResetSchema(only=('email', 'code')).load(request.get_json())
        if errors:
            return errors, 422
        return self._verify(args['email'], args['code'])


class ResendVerificationMail(Resource):
    """Resend verification mail to user."""

    def post(self):
        args, errors = EmailSchema().load(request.get_json())
        if errors:
            return errors, 422
        user = User.query.filter(User.email == args['email']).filter(User.deleted == False).first()
        if user:
            user.verification_code = crypto.get_random_string(length=12)
            db.session.add(user)
            db.session.commit()
            _send_verification_email(user)
            return {"message": "Check your email for verification link"}
        else:
            return {"message": "No account exists with the given email."}, 401
