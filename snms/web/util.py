# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from __future__ import absolute_import, unicode_literals

import os
import re
import time
from importlib import import_module

from flask import send_file as _send_file
from flask import url_for as _url_for
from flask import Blueprint, current_app, g, redirect, request
from flask.helpers import get_root_path
from werkzeug.exceptions import NotFound
from werkzeug.routing import BaseConverter, BuildError
from werkzeug.utils import secure_filename


def discover_blueprints():
    """Discovers all blueprints inside the snms package

    Only blueprints in a ``blueprint.py`` module or inside a
    ``blueprints`` package are loaded. Any other files are not touched
    or even imported.

    :return: a ``blueprints, compat_blueprints`` tuple containing two
             sets of blueprints
    """
    package_root = get_root_path('snms')
    modules = set()
    for root, dirs, files in os.walk(package_root):
        for name in files:
            if not name.endswith('.py') or name.endswith('_test.py'):
                continue
            segments = ['snms'] + os.path.relpath(root, package_root).replace(os.sep, '.').split('.') + [name[:-3]]
            if segments[-1] == 'blueprint':
                modules.add('.'.join(segments))
            elif 'blueprints' in segments[:-1]:
                if segments[-1] == '__init__':
                    modules.add('.'.join(segments[:-1]))
                else:
                    modules.add('.'.join(segments))

    blueprints = set()
    for module_name in sorted(modules):
        module = import_module(module_name)
        for name in dir(module):
            obj = getattr(module, name)
            if name.startswith('__') or not isinstance(obj, Blueprint):
                continue
            else:
                blueprints.add(obj)
    return blueprints


def iter_blueprint_rules(blueprint):
    for func in blueprint.deferred_functions:
        yield dict(zip(func.func_code.co_freevars, (c.cell_contents for c in func.func_closure)))


def legacy_rule_from_endpoint(endpoint):
    endpoint = re.sub(r':\d+$', '', endpoint)
    if '-' in endpoint:
        return '/' + endpoint.replace('-', '.py/')
    else:
        return '/' + endpoint + '.py'


def make_compat_redirect_func(blueprint, endpoint, view_func=None, view_args_conv=None):
    def _redirect(**view_args):
        # In case of POST we can't safely redirect since the method would switch to GET
        # and thus the request would most likely fail.
        if view_func and request.method == 'POST':
            return view_func(**view_args)
        # Ugly hack to get non-list arguments unless they are used multiple times.
        # This is necessary since passing a list for an URL path argument breaks things.
        view_args.update((k, v[0] if len(v) == 1 else v) for k, v in request.args.iterlists())
        if view_args_conv is not None:
            for oldkey, newkey in view_args_conv.items():
                value = view_args.pop(oldkey, None)
                if newkey is not None:
                    view_args[newkey] = value
        try:
            target = _url_for('%s.%s' % (getattr(blueprint, 'name', blueprint), endpoint), **view_args)
        except (BuildError, ValueError):
            raise NotFound
        return redirect(target, 302 if current_app.debug else 301)
    return _redirect


def send_file(name, path_or_fd, mimetype, last_modified=None, no_cache=True, inline=None, conditional=False, safe=True):
    """Sends a file to the user.

    `name` is required and should be the filename visible to the user.
    `path_or_fd` is either the physical path to the file or a file-like object (e.g. a StringIO).
    `mimetype` SHOULD be a proper MIME type such as image/png. It may also be an snms-style file type such as JPG.
    `last_modified` may contain a unix timestamp or datetime object indicating the last modification of the file.
    `no_cache` can be set to False to disable no-cache headers.
    `inline` defaults to true except for certain filetypes like XML and CSV. It SHOULD be set to false only when you
    want to force the user's browser to download the file. Usually it is much nicer if e.g. a PDF file can be displayed
    inline so don't disable it unless really necessary.
    `conditional` is very useful when sending static files such as CSS/JS/images. It will allow the browser to retrieve
    the file only if it has been modified (based on mtime and size).
    `safe` adds some basic security features such a adding a content-security-policy and forcing inline=False for
    text/html mimetypes
    """

    name = secure_filename(name)
    assert '/' in mimetype
    if inline is None:
        inline = mimetype not in ('text/csv', 'text/xml', 'application/xml')
    if request.user_agent.platform == 'android':
        # Android is just full of fail when it comes to inline content-disposition...
        inline = False
    if safe and mimetype in ('text/html', 'image/svg+xml'):
        inline = False
    try:
        rv = _send_file(path_or_fd, mimetype=mimetype, as_attachment=not inline, attachment_filename=name,
                        conditional=conditional)
    except IOError:
        if not current_app.debug:
            raise
        raise NotFound('File not found: %s' % path_or_fd)
    if safe:
        rv.headers.add('Content-Security-Policy', "script-src 'self'; object-src 'self'")
    if inline:
        # send_file does not add this header if as_attachment is False
        rv.headers.add('Content-Disposition', 'inline', filename=name)
    if last_modified:
        if not isinstance(last_modified, int):
            last_modified = int(time.mktime(last_modified.timetuple()))
        rv.last_modified = last_modified
    if no_cache:
        del rv.expires
        del rv.cache_control.max_age
        rv.cache_control.public = False
        rv.cache_control.private = True
        rv.cache_control.no_cache = True
    return rv


# Note: When adding custom converters please do not forget to add them to converter_functions in routing.js
# if they need any custom processing (i.e. not just encodeURIComponent) in JavaScript.
class ListConverter(BaseConverter):
    """Matches a dash-separated list"""

    def __init__(self, map):
        BaseConverter.__init__(self, map)
        self.regex = '\w+(?:-\w+)*'

    def to_python(self, value):
        return value.split('-')

    def to_url(self, value):
        if isinstance(value, (list, tuple, set)):
            value = '-'.join(value)
        return super(ListConverter, self).to_url(value)


class XAccelMiddleware(object):
    """A WSGI Middleware that converts X-Sendfile headers to X-Accel-Redirect
    headers if possible.

    If the path is not mapped to a URI usable for X-Sendfile we abort with an
    error since it likely means there is a misconfiguration.
    """

    def __init__(self, app, mapping):
        self.app = app
        self.mapping = mapping.items()

    def __call__(self, environ, start_response):
        def _start_response(status, headers, exc_info=None):
            xsf_path = None
            new_headers = []
            for name, value in headers:
                if name.lower() == 'x-sendfile':
                    xsf_path = value
                else:
                    new_headers.append((name, value))
            if xsf_path:
                uri = self.make_x_accel_header(xsf_path)
                if not uri:
                    raise ValueError('Could not map {} to a URI'.format(xsf_path))
                new_headers.append((b'X-Accel-Redirect', uri))
            return start_response(status, new_headers, exc_info)

        return self.app(environ, _start_response)

    def make_x_accel_header(self, path):
        for base, uri in self.mapping:
            if path.startswith(str(base + '/')):
                return uri + path[len(base):]


class SnmsConfigWrapper(object):
    """Makes SNMS config vars available as vars instead of ugly getter methods."""
    def __init__(self, config):
        self.config = config

    def __getattr__(self, item):
        getter = 'get' + item[0].upper() + item[1:]
        return getattr(self.config, getter)()
