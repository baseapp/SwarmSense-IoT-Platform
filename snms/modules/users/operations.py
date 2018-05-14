# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from __future__ import unicode_literals

from snms.core import signals
from snms.core.db import db
from snms.modules.users import User


def create_user(email, data, identity=None, settings=None, other_emails=None, from_moderation=True):
    """Create a new user.

    This may also convert a pending user to a proper user in case the
    email address matches such a user.

    :param email: The primary email address of the user.
    :param data: The data used to populate the user.
    :param identity: An `Identity` to associate with the user.
    :param settings: A dict containing user settings.
    :param other_emails: A set of email addresses that are also used
                         to check for a pending user. They will also
                         be added as secondary emails to the user.
    :param from_moderation: Whether the user was created through the
                            moderation process or manually by an admin.
    """
    # Get a pending user if there is one
    user = User.find_first(~User.is_deleted, User.email == email)
    if not user:
        user = User()

    user.email = email
    user.populate_from_dict(data)
    db.session.add(user)
    db.session.flush()
    signals.users.registered.send(user, from_moderation=from_moderation, identity=identity)
    db.session.flush()
    return user
