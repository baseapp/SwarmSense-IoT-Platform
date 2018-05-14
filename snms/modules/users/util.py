# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from __future__ import unicode_literals

from collections import OrderedDict
from operator import itemgetter

from sqlalchemy.orm import contains_eager, joinedload, load_only, undefer

from snms.core import signals
# from snms.core.auth import multipass
from snms.core.db import db
from snms.core.db.sqlalchemy.custom.unaccent import unaccent_match
from snms.core.db.sqlalchemy.principals import PrincipalType
from snms.modules.users import User, logger
from snms.utils.string import crc32


# colors for user-specific avatar bubbles
user_colors = ['#e06055', '#ff8a65', '#e91e63', '#f06292', '#673ab7', '#ba68c8', '#7986cb', '#3f51b5', '#5e97f6',
               '#00a4e4', '#4dd0e1', '#0097a7', '#d4e157', '#aed581', '#57bb8a', '#4db6ac', '#607d8b', '#795548',
               '#a1887f', '#fdd835', '#a3a3a3']


def get_admin_emails():
    """Get the email addresses of all SNMS admins"""
    return {u.email for u in User.find(is_admin=True, is_deleted=False)}

def serialize_user(user):
    """Serialize user to JSON-like object"""
    return {
        'id': user.id,
        'title': user.title,
        'identifier': 'User:{}'.format(user.id),
        'name': user.full_name,
        'familyName': user.last_name,
        'firstName': user.first_name,
        'phone': user.phone,
        'email': user.email,
        '_type': 'Avatar'
    }


def search_users(exact=False, include_deleted=False, include_pending=False, external=False, allow_system_user=False,
                 **criteria):
    """Searches for users.

    :param exact: Indicates if only exact matches should be returned.
                  This is MUCH faster than a non-exact saerch,
                  especially when searching external users.
    :param include_deleted: Indicates if also users marked as deleted
                            should be returned.
    :param include_pending: Indicates if also users who are still
                            pending should be returned.
    :param external: Indicates if identity providers should be searched
                     for matching users.
    :param allow_system_user: Whether the system user may be returned
                              in the search results.
    :param criteria: A dict containing any of the following keys:
                     first_name, last_name, email, affiliation, phone,
                     address
    :return: A set of matching users. If `external` was set, it may
             contain both :class:`~flask_multipass.IdentityInfo` objects
             for external users not yet in SNMS and :class:`.User`
             objects for existing users.
    """
    unspecified = object()
    query = User.query.options(db.joinedload(User.identities),
                               db.joinedload(User._all_emails),
                               db.joinedload(User.merged_into_user))
    criteria = {key: value.strip() for key, value in criteria.items() if value.strip()}
    original_criteria = dict(criteria)

    if not criteria:
        return set()

    if not include_pending:
        query = query.filter(~User.is_pending)
    if not include_deleted:
        query = query.filter(~User.is_deleted)

    affiliation = criteria.pop('affiliation', unspecified)
    if affiliation is not unspecified:
        query = query.join(UserAffiliation).filter(unaccent_match(UserAffiliation.name, affiliation, exact))

    email = criteria.pop('email', unspecified)
    if email is not unspecified:
        query = query.join(UserEmail).filter(unaccent_match(UserEmail.email, email, exact))

    for k, v in criteria.items():
        query = query.filter(unaccent_match(getattr(User, k), v, exact))

    found_emails = {}
    found_identities = {}
    system_user = set()
    for user in query:
        for identity in user.identities:
            found_identities[(identity.provider, identity.identifier)] = user
        for email in user.all_emails:
            found_emails[email] = user
        if user.is_system and not user.all_emails and allow_system_user:
            system_user = {user}

    # external user providers
    if external:
        identities = multipass.search_identities(exact=exact, **original_criteria)

        for ident in identities:
            if not ident.data.get('email'):
                # Skip users with no email
                continue
            if ((ident.provider.name, ident.identifier) not in found_identities and
                    ident.data['email'].lower() not in found_emails):
                found_emails[ident.data['email'].lower()] = ident
                found_identities[(ident.provider, ident.identifier)] = ident

    return set(found_emails.viewvalues()) | system_user


def get_user_by_email(email, create_pending=False):
    """finds a user based on his email address.

    :param email: The email address of the user.
    :param create_pending: If True, this function searches for external
                           users and creates a new pending User in case
                           no existing user was found.
    :return: A :class:`.User` instance or ``None`` if not exactly one
             user was found.
    """
    email = email.lower().strip()
    if not email:
        return None
    if not create_pending:
        res = User.find_all(~User.is_deleted, User.all_emails.contains(email))
    else:
        res = search_users(exact=True, include_pending=True, external=True, email=email)
    if len(res) != 1:
        return None
    user_or_identity = next(iter(res))
    if isinstance(user_or_identity, User):
        return user_or_identity
    elif not create_pending:
        return None
    # Create a new pending user
    data = user_or_identity.data
    user = User(first_name=data.get('first_name') or '', last_name=data.get('last_name') or '', email=data['email'],
                address=data.get('address', ''), phone=data.get('phone', ''),
                affiliation=data.get('affiliation', ''), is_pending=True)
    db.session.add(user)
    db.session.flush()
    return user

#
# def merge_users(source, target, force=False):
#     """Merge two users together, unifying all related data
#
#     :param source: source user (will be set as deleted)
#     :param target: target user (final)
#     """
#
#     if source.is_deleted and not force:
#         raise ValueError('Source user {} has been deleted. Merge aborted.'.format(source))
#
#     if target.is_deleted:
#         raise ValueError('Target user {} has been deleted. Merge aborted.'.format(target))
#
#     # Move emails to the target user
#     primary_source_email = source.email
#     logger.info("Target %s initial emails: %s", target, ', '.join(target.all_emails))
#     logger.info("Source %s emails to be linked to target %s: %s", source, target, ', '.join(source.all_emails))
#     UserEmail.find(user_id=source.id).update({
#         UserEmail.user_id: target.id,
#         UserEmail.is_primary: False
#     })
#
#     # Make sure we don't have stale data after the bulk update we just performed
#     db.session.expire_all()
#
#     # Update favorites
#     target.favorite_users |= source.favorite_users
#     target.favorite_of |= source.favorite_of
#     target.favorite_categories |= source.favorite_categories
#
#     # Update category suggestions
#     SuggestedCategory.merge_users(target, source)
#
#     # Merge identities
#     for identity in set(source.identities):
#         identity.user = target
#
#     # Notify signal listeners about the merge
#     signals.users.merged.send(target, source=source)
#     db.session.flush()
#
#     # Mark source as merged
#     source.merged_into_user = target
#     source.is_deleted = True
#     db.session.flush()
#
#     # Restore the source user's primary email
#     source.email = primary_source_email
#     db.session.flush()
#
#     logger.info("Successfully merged %s into %s", source, target)
#

def get_color_for_username(username):
    return user_colors[crc32(username) % len(user_colors)]
