from __future__ import unicode_literals

import datetime
import itertools
import os
import re
import sys
from functools import partial
from operator import attrgetter, itemgetter

import click
import sqlalchemy.orm
from contextlib2 import ExitStack
from flask import current_app

import snms
from snms.core.celery import celery
from snms.core.config import config
from snms.core.db import db
from snms.utils.console import cformat
from snms.utils.date_time import now_utc, server_to_utc
from snms.web.stats import request_stats_request_started


def _add_to_context(namespace, info, element, name=None, doc=None, color='green'):
    if not name:
        name = element.__name__
    namespace[name] = element
    if doc:
        info.append(cformat('+ %%{%s}{}%%{white!} ({})' % color).format(name, doc))
    else:
        info.append(cformat('+ %%{%s}{}' % color).format(name))


def _add_to_context_multi(namespace, info, elements, names=None, doc=None, color='green'):
    if not names:
        names = [x.__name__ for x in elements]
    for name, element in zip(names, elements):
        namespace[name] = element
    if doc:
        info.append(cformat('+ %%{white!}{}:%%{reset} %%{%s}{}' % color).format(doc, ', '.join(names)))
    else:
        info.append(cformat('+ %%{%s}{}' % color).format(', '.join(names)))


def _add_to_context_smart(namespace, info, objects, get_name=attrgetter('__name__'), color='cyan'):
    def _get_module(obj):
        segments = tuple(obj.__module__.split('.'))
        if segments[0].startswith('snms_'):  # plugin
            return 'plugin:{}'.format(segments[0])
        elif segments[:2] == ('snms', 'modules'):
            return 'module:{}'.format(segments[2])
        elif segments[:2] == ('snms', 'core'):
            return 'core:{}'.format(segments[2])
        else:
            return '.'.join(segments[:-1] if len(segments) > 1 else segments)

    items = [(_get_module(obj), get_name(obj), obj) for obj in objects]
    for module, items in itertools.groupby(sorted(items, key=itemgetter(0, 1)), key=itemgetter(0)):
        names, elements = zip(*((x[1], x[2]) for x in items))
        _add_to_context_multi(namespace, info, elements, names, doc=module, color=color)


def _make_shell_context():
    context = {}
    info = [cformat('%{white!}Available objects')]
    add_to_context = partial(_add_to_context, context, info)
    add_to_context_multi = partial(_add_to_context_multi, context, info)
    add_to_context_smart = partial(_add_to_context_smart, context, info)
    # Common stdlib modules
    info.append(cformat('*** %{magenta!}stdlib%{reset} ***'))
    DATETIME_ATTRS = ('date', 'time', 'datetime', 'timedelta')
    ORM_ATTRS = ('joinedload', 'defaultload', 'contains_eager', 'lazyload', 'noload', 'subqueryload', 'undefer',
                 'undefer_group', 'load_only')
    add_to_context_multi([getattr(datetime, attr) for attr in DATETIME_ATTRS] +
                         [getattr(sqlalchemy.orm, attr) for attr in ORM_ATTRS] +
                         [itertools, re, sys, os],
                         color='yellow')
    # Models
    info.append(cformat('*** %{magenta!}Models%{reset} ***'))
    models = [cls for name, cls in sorted(db.Model._decl_class_registry.items(), key=itemgetter(0))
              if hasattr(cls, '__table__')]
    add_to_context_smart(models)
    # Tasks
    info.append(cformat('*** %{magenta!}Tasks%{reset} ***'))
    tasks = [task for task in celery.tasks.values() if not task.name.startswith('celery.')]
    add_to_context_smart(tasks, get_name=lambda x: x.name.replace('.', '_'), color='blue!')
    # Plugins
    info.append(cformat('*** %{magenta!}Plugins%{reset} ***'))

    # Utils
    info.append(cformat('*** %{magenta!}Misc%{reset} ***'))
    add_to_context(celery, 'celery', doc='celery app', color='blue!')
    add_to_context(db, 'db', doc='sqlalchemy db interface', color='cyan!')
    add_to_context(now_utc, 'now_utc', doc='get current utc time', color='cyan!')
    add_to_context(config, 'config', doc='snms config')
    add_to_context(current_app, 'app', doc='flask app')
    add_to_context(lambda *a, **kw: server_to_utc(datetime.datetime(*a, **kw)), 'dt',
                   doc='like datetime() but converted from localtime to utc')
    # Stuff from plugins
    # signals.plugin.shell_context.send(add_to_context=add_to_context, add_to_context_multi=add_to_context_multi)
    return context, info


def shell_cmd(verbose, with_req_context):
    try:
        from IPython.terminal.ipapp import TerminalIPythonApp
    except ImportError:
        click.echo(cformat('%{red!}You need to `pip install ipython` to use the SNMS shell'))
        sys.exit(1)

    current_app.config['REPL'] = True  # disables e.g. memoize_request
    request_stats_request_started()
    context, info = _make_shell_context()
    banner = cformat('%{yellow!}SNMS v{} is ready for your commands').format(snms.__version__)
    if verbose:
        banner = '\n'.join(info + ['', banner])
    ctx = current_app.make_shell_context()
    ctx.update(context)
    # clearCache()
    stack = ExitStack()
    if with_req_context:
        stack.enter_context(current_app.test_request_context(base_url=config.BASE_URL))
    with stack:
        ipython_app = TerminalIPythonApp.instance(user_ns=ctx, display_banner=False)
        ipython_app.initialize(argv=[])
        ipython_app.shell.show_banner(banner)
        ipython_app.start()
