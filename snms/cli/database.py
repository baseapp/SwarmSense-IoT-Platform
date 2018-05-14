from __future__ import unicode_literals

import os
import sys
from functools import partial

import click
from flask import current_app
from flask.cli import with_appcontext
from flask_migrate.cli import db as flask_migrate_cli
from terminaltables import AsciiTable

import snms
from snms.cli.core import cli_group
from snms.core.db import db
from snms.core.db.sqlalchemy.migration import migrate, prepare_db
from snms.utils.console import cformat
from snms.database import tsdb


@cli_group()
@click.option('--plugin', metavar='PLUGIN', help='Execute the command for the given plugin')
@click.option('--all-plugins', is_flag=True, help='Execute the command for all plugins')
@click.pass_context
@with_appcontext
def cli(ctx, plugin=None, all_plugins=False):
    migrate.init_app(current_app, db, os.path.join(current_app.root_path, 'migrations'))


@cli.command()
def prepare():
    """Initializes a new database (creates tables, sets alembic rev to HEAD)"""
    tsdb.create_defaults()
    return prepare_db()


@cli.command()
def purge():
    """Remove deleted companies, sensors, and other data."""
    print(cformat('%{yellow!}*** DANGER'))
    print(cformat('%{yellow!}***%{reset} '
                  '%{red!}This operation will %{yellow!}PERMANENTLY ERASE %{red!} data!%{reset}'))
    from snms.modules.sensors import Sensor, SensorType
    deleted_sensors = Sensor.find(Sensor.deleted).all()
    tabledata = [['ID', 'Name', 'Created On']]
    for sensor in deleted_sensors:
        tabledata.append([str(sensor.id), sensor.name, sensor.created_at])
    table = AsciiTable(tabledata, cformat('%{white!}Deleted Sensors%{reset}'))
    print(table.table)


def _stamp(plugin=None, revision=None):
    table = 'alembic_version' if not plugin else 'alembic_version_plugin_{}'.format(plugin)
    db.session.execute('DELETE FROM {}'.format(table))
    if revision:
        db.session.execute('INSERT INTO {} VALUES (:revision)'.format(table), {'revision': revision})


def _safe_downgrade(*args, **kwargs):
    func = kwargs.pop('_func')
    print(cformat('%{yellow!}*** DANGER'))
    print(cformat('%{yellow!}***%{reset} '
                  '%{red!}This operation may %{yellow!}PERMANENTLY ERASE %{red!}some data!%{reset}'))
    if current_app.debug:
        skip_confirm = os.environ.get('SNMS_ALWAYS_DOWNGRADE', '').lower() in ('1', 'yes')
        print(cformat('%{yellow!}***%{reset} '
                      "%{green!}Debug mode is active, so you probably won't destroy valuable data"))
    else:
        skip_confirm = False
        print(cformat('%{yellow!}***%{reset} '
                      "%{red!}Debug mode is NOT ACTIVE, so make sure you are on the right machine!"))
    if not skip_confirm and input(cformat('%{yellow!}***%{reset} '
                                              'To confirm this, enter %{yellow!}YES%{reset}: ')) != 'YES':
        print(cformat('%{green}Aborted%{reset}'))
        sys.exit(1)
    else:
        return func(*args, **kwargs)


def _setup_cli():
    for command in flask_migrate_cli.commands.values():
        if command.name == 'init':
            continue
        if command.name == 'downgrade':
            command.callback = partial(with_appcontext(_safe_downgrade), _func=command.callback)
        cli.add_command(command)

_setup_cli()
del _setup_cli
