# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

import itertools
from sqlalchemy.exc import IntegrityError
import pytest

from snms.modules.users import User


def test_emails(db):
    user = User(name='Guinea')
    db.session.add(user)
    db.session.flush()
    assert user.email is None


def test_deletion(db):
    user = User(name='Foo', email='foo@bar.com')
    db.session.add(user)
    db.session.flush()
    assert not user.deleted


def test_deletion_no_primary_email():
    user = User()
    assert user.email is None
    assert user.deleted is None


def test_unique_email(create_user):
    user_1 = create_user(1, email='dummy@example.com')
    assert user_1.id is 1
    with pytest.raises(IntegrityError):
        user_2 = create_user(2, email='dummy@example.com')
