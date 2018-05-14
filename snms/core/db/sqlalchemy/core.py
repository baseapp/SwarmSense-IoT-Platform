from __future__ import absolute_import

import logging
import sys
from contextlib import contextmanager
from functools import partial

import flask_sqlalchemy
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.event import listen
from sqlalchemy.exc import DatabaseError
from sqlalchemy.orm import CompositeProperty, mapper
from sqlalchemy.sql.ddl import CreateSchema
from werkzeug.utils import cached_property

from snms.core import signals
# from snms.core.db.sqlalchemy.custom.unaccent import create_unaccent_function
from snms.utils.six import string_types
# Monkeypatching this since Flask-SQLAlchemy doesn't let us override the model class
# isort:skip_file
from snms.core.db.sqlalchemy.util.models import SnmsBaseQuery, SnmsModel
flask_sqlalchemy.Model = SnmsModel
flask_sqlalchemy.BaseQuery = SnmsBaseQuery


class ConstraintViolated(Exception):
    """Indicates that a constraint trigger was violated"""
    def __init__(self, message, orig):
        super(ConstraintViolated, self).__init__(message)
        self.orig = orig


def handle_sqlalchemy_database_error():
    """Handle a SQLAlchemy DatabaseError exception nicely

    Currently this only takes care of custom INDX exception
    raised from constraint triggers.  It must be invoked from an
    ``except DatabaseError`` block.

    :raise ConstraintViolated: if an exception with an SQLSTATE of
                               ``INDX*`` has been thrown.  This is
                               used in custom constraint triggers
                               that enforce consistenct
    :raise DatabaseError: any other database error is simply re-raised
    """
    exc_class, exc, tb = sys.exc_info()
    if exc.orig.pgcode is None or not exc.orig.pgcode.startswith('INDX'):
        # not an snms exception
        raise Exception("SQLAlchemy Database error")
    msg = exc.orig.diag.message_primary
    if exc.orig.diag.message_detail:
        msg += ': {}'.format(exc.orig.diag.message_detail)
    if exc.orig.diag.message_hint:
        msg += ' ({})'.format(exc.orig.diag.message_hint)
    raise ConstraintViolated(msg, exc.orig)  # raise with original traceback


class SnmsSQLAlchemy(SQLAlchemy):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.m = type('_Models', (object,), {})

    def enforce_constraints(self):
        """Enables immedaite enforcing of deferred constraints.

        This should be done at the end of normal request processing
        and exceptions should be handled in a clean way that goes
        beyond letting the user report an error.  If you do not expect
        a deferred constraint to be violated do not use this - the
        constraints will be checked at commit time and result in an
        error if there are any violations.

        Constraints will revert to their default deferred mode once
        the active transaction ends, i.e. on rollback or commit.

        Exceptions from custom constraint triggers will raise
        `ConstraintViolated`.
        """
        self.session.flush()
        try:
            self.session.execute('SET CONSTRAINTS ALL IMMEDIATE')
        except DatabaseError:
            handle_sqlalchemy_database_error()

    @cached_property
    def logger(self):
        from snms.core.logger import Logger

        logger = Logger.get('db')
        logger.setLevel(logging.DEBUG)
        return logger

    @contextmanager
    def tmp_session(self):
        """Provides a contextmanager with a temporary SQLAlchemy session.

        This allows you to use SQLAlchemy e.g. in a `after_this_request`
        callback without having to worry about things like the ZODB extension,
        implicit commits, etc.
        """
        session = db.create_session({'query_cls': SnmsBaseQuery})
        try:
            yield session
        except:
            session.rollback()
            raise
        finally:
            session.close()


def on_models_committed(sender, changes):
    for obj, change in changes:
        obj.__committed__(change)


def _schema_exists(connection, name):
    sql = 'SELECT COUNT(*) FROM "information_schema"."schemata" WHERE "schema_name" = :name'
    count = connection.execute(db.text(sql), name=name).scalar()
    return bool(count)


def _before_create(target, connection, **kw):
    # SQLAlchemy doesn't create schemas so we need to take care of it...
    schemas = {table.schema for table in kw['tables']}
    for schema in schemas:
        if schema and not _schema_exists(connection, schema):
            CreateSchema(schema).execute(connection)
            signals.db_schema_created.send(str(schema), connection=connection)


def _mapper_configured(mapper, class_):
    # Make model available via db.m.*
    setattr(db.m, class_.__name__, class_)

    # Create a setter listener to coerce attribute values for custom types supporting it
    def _coerce_custom(target, value, oldvalue, initiator, fn):
        return fn(value)

    for prop in mapper.iterate_properties:
        if hasattr(prop, 'columns') and not isinstance(prop, CompositeProperty):
            func = getattr(prop.columns[0].type, 'coerce_set_value', None)
            if func is not None:
                # Using partial here to avoid closure scoping issues
                listen(getattr(class_, prop.key), 'set', partial(_coerce_custom, fn=func), retval=True)


def _column_names(constraint, table):
    return '_'.join((c if isinstance(c, string_types) else c.name) for c in constraint.columns)


def _unique_index(constraint, table):
    return 'uq_' if constraint.unique else ''


naming_convention = {
    'fk': 'fk_%(table_name)s_%(column_names)s_%(referred_table_name)s',
    'pk': 'pk_%(table_name)s',
    'ix': 'ix_%(unique_index)s%(table_name)s_%(column_names)s',
    'ck': 'ck_%(table_name)s_%(constraint_name)s',
    'uq': 'uq_%(table_name)s_%(column_names)s',
    'column_names': _column_names,
    'unique_index': _unique_index
}

db = SnmsSQLAlchemy(query_class=SnmsBaseQuery, model_class=SnmsModel)
db.Model.metadata.naming_convention = naming_convention
listen(db.Model.metadata, 'before_create', _before_create)
listen(mapper, 'mapper_configured', _mapper_configured)
