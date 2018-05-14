import os
import re
import shutil
import signal
import subprocess
import tempfile
from contextlib import contextmanager

import pytest
from sqlalchemy import event
from sqlalchemy.engine import Engine

from snms.core.db import db as db_
from snms.core.db.sqlalchemy.util.management import create_all_tables, delete_all_tables
from snms.web.app import configure_db


def silent_check_call(*args, **kwargs):
    """Wrapper for `subprocess.check_call` which silences all output"""
    with open(os.devnull, 'w') as devnull:
        return subprocess.check_call(*args, stdout=devnull, stderr=devnull, **kwargs)

@pytest.fixture(scope='session')
def postgresql():
    """Provides a clean temporary PostgreSQL server/database.

    If the environment variable `SNMS_TEST_DATABASE_URI` is set, this fixture
    will do nothing and simply return the connection string from that variable
    """

    # Use existing database
    if 'SNMS_TEST_DATABASE_URI' in os.environ:
        yield os.environ['SNMS_TEST_DATABASE_URI']
        return

    db_name = 'test'

    # Ensure we have initdb and a recent enough postgres version
    try:
        version_output = subprocess.check_output(['initdb', '--version'])
    except Exception as e:
        pytest.skip('Could not retrieve PostgreSQL version: {}'.format(e))
    pg_version = map(int, re.match(r'initdb \(PostgreSQL\) ((?:\d+\.?)+)', version_output).group(1).split('.'))
    if pg_version[0] < 9 or (pg_version[0] == 9 and pg_version[1] < 2):
        pytest.skip('PostgreSQL version is too old: {}'.format(version_output))

    # Prepare server instance and a test database
    temp_dir = tempfile.mkdtemp(prefix='snmstestpg.')
    postgres_args = '-h "" -k "{}"'.format(temp_dir)
    try:
        silent_check_call(['initdb', '--encoding', 'UTF8', temp_dir])
        silent_check_call(['pg_ctl', '-D', temp_dir, '-w', '-o', postgres_args, 'start'])
        silent_check_call(['createdb', '-h', temp_dir, db_name])
        silent_check_call(['psql', '-h', temp_dir, db_name, '-c', 'CREATE EXTENSION unaccent;'])
        silent_check_call(['psql', '-h', temp_dir, db_name, '-c', 'CREATE EXTENSION pg_trgm;'])
    except Exception as e:
        shutil.rmtree(temp_dir)
        pytest.skip('Could not init/start PostgreSQL: {}'.format(e))

    yield 'postgresql:///{}?host={}'.format(db_name, temp_dir)

    try:
        silent_check_call(['pg_ctl', '-D', temp_dir, '-m', 'immediate', 'stop'])
    except Exception as e:
        # If it failed for any reason, try killing it
        try:
            with open(os.path.join(temp_dir, 'postmaster.pid')) as f:
                pid = int(f.readline().strip())
                os.kill(pid, signal.SIGKILL)
            pytest.skip('Could not stop postgresql; killed it instead: {}'.format(e))
        except Exception as e:
            pytest.skip('Could not stop/kill postgresql: {}'.format(e))
    finally:
        shutil.rmtree(temp_dir)


@pytest.fixture(scope='session')
def database(app, postgresql):
    """Creates a test database which is destroyed afterwards

    Used only internally, if you need to access the database use `db` instead to ensure
    your modifications are not persistent!
    """
    app.config['SQLALCHEMY_DATABASE_URI'] = postgresql
    configure_db(app)
    if 'SNMS_TEST_DATABASE_URI' in os.environ and os.environ.get('SNMS_TEST_DATABASE_HAS_TABLES') == '1':
        yield db_
        return
    with app.app_context():
        create_all_tables(db_, add_initial_data=False)
    yield db_
    db_.session.remove()
    with app.app_context():
        delete_all_tables(db_)


@pytest.fixture
def db(database, monkeypatch):
    """Provides database access and ensures changes do not persist"""
    # Prevent database/session modifications
    monkeypatch.setattr(database.session, 'commit', database.session.flush)
    monkeypatch.setattr(database.session, 'remove', lambda: None)
    @contextmanager
    def _tmp_session():
        _old_commit = database.session.commit
        database.session.commit = lambda: None
        yield database.session
        database.session.commit = _old_commit
    monkeypatch.setattr(database, 'tmp_session', _tmp_session, lambda: None)
    yield database
    database.session.rollback()
    database.session.remove()


@pytest.fixture
@pytest.mark.usefixtures('db')
def count_queries():
    """Provides a query counter.

    Usage::

        with count_queries() as count:
            do_stuff()
        assert count() == number_of_queries
    """
    def _after_cursor_execute(*args, **kwargs):
        if active_counter[0]:
            active_counter[0][0] += 1

    @contextmanager
    def _counter():
        if active_counter[0]:
            raise RuntimeError('Cannot nest count_queries calls')
        active_counter[0] = counter = [0]
        try:
            yield lambda: counter[0]
        finally:
            active_counter[0] = None

    active_counter = [None]
    event.listen(Engine, 'after_cursor_execute', _after_cursor_execute)
    try:
        yield _counter
    finally:
        event.remove(Engine, 'after_cursor_execute', _after_cursor_execute)
