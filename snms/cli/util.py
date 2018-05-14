from __future__ import unicode_literals

import traceback
from importlib import import_module

import click
from flask.cli import AppGroup, FlaskGroup, ScriptInfo
# from flask_pluginengine import wrap_in_plugin_context
from werkzeug.utils import cached_property


# XXX: Do not import any snms modules in here!
# See the comment in snms.cli.core for details.
# If there is ever the need to add more utils to be used in commands,
# consider renaming this file to `coreutil.py` and adding a new
# `util.py` for whatever you are going to add.


def _create_app(info):
    from snms.web.app import make_app
    return make_app(set_path=False)


class SnmsFlaskGroup(FlaskGroup):
    """
    A flask-enhanced click Group that includes commands provided
    by SNMS plugins.
    """

    def __init__(self, **extra):
        super(SnmsFlaskGroup, self).__init__(create_app=_create_app, add_default_commands=False,
                                               add_version_option=False, **extra)
        self._snms_plugin_commands = None

    def _get_snms_plugin_commands(self, ctx):
        rv = {}
        if self._snms_plugin_commands is not None:
            return self._snms_plugin_commands
        try:
            from snms.core import signals
            from snms.utils.signals import named_objects_from_signal
        except Exception as exc:
            if 'No snms config found' not in str(exc):
                click.echo(click.style('Loading plugin commands failed:', fg='red', bold=True))
                click.echo(click.style(traceback.format_exc(), fg='red'))
            rv = {}
        self._snms_plugin_commands = rv
        return rv

    def get_command(self, ctx, name):
        rv = AppGroup.get_command(self, ctx, name)
        if rv is not None:
            return rv
        return self._get_snms_plugin_commands(ctx).get(name)

    def list_commands(self, ctx):
        rv = set(click.Group.list_commands(self, ctx))
        return sorted(rv)


class LazyGroup(click.Group):
    """
    A click Group that imports the actual implementation only when
    needed.  This allows for more resilient CLIs where the top-level
    command does not fail when a subcommand is broken enough to fail
    at import time.
    """

    def __init__(self, import_name, **kwargs):
        self._import_name = import_name
        super(LazyGroup, self).__init__(**kwargs)

    @cached_property
    def _impl(self):
        module, name = self._import_name.split(':', 1)
        return getattr(import_module(module), name)

    def get_command(self, ctx, cmd_name):
        return self._impl.get_command(ctx, cmd_name)

    def list_commands(self, ctx):
        return self._impl.list_commands(ctx)

    def invoke(self, ctx):
        return self._impl.invoke(ctx)

    def get_usage(self, ctx):
        return self._impl.get_usage(ctx)

    def get_params(self, ctx):
        return self._impl.get_params(ctx)
