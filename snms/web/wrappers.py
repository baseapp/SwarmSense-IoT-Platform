# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from __future__ import absolute_import, unicode_literals

import os
from contextlib import contextmanager
from uuid import uuid4

from flask import Blueprint, Flask, request
from flask.blueprints import BlueprintSetupState
from flask.wrappers import Request
from jinja2 import FileSystemLoader, TemplateNotFound
from werkzeug.datastructures import ImmutableOrderedMultiDict
from werkzeug.utils import cached_property
from flask_pluginengine import PluginFlaskMixin

_notset = object()


class SnmsRequest(Request):
    parameter_storage_class = ImmutableOrderedMultiDict

    @cached_property
    def id(self):
        return uuid4().hex[:16]

    @cached_property
    def relative_url(self):
        """The request's path including its query string if applicable.

        This basically `full_path` but without the ugly trailing
        questionmark if there is no query string.
        """
        return self.full_path.rstrip('?')

    @cached_property
    def remote_addr(self):
        ip = super(SnmsRequest, self).remote_addr
        if ip is not None and ip.startswith('::ffff:'):
            # convert ipv6-style ipv4 to the regular ipv4 notation
            ip = ip[7:]
        return ip

    def __repr__(self):
        rv = super(SnmsRequest, self).__repr__()
        if isinstance(rv, str):
            rv = rv.encode('utf-8')
        return rv


class SnmsFlask(PluginFlaskMixin, Flask):
    request_class = SnmsRequest


class SnmsBlueprintSetupState(BlueprintSetupState):
    @contextmanager
    def _unprefixed(self):
        prefix = self.url_prefix
        self.url_prefix = None
        yield
        self.url_prefix = prefix

    def add_url_rule(self, rule, endpoint=None, view_func=None, **options):
        if rule.startswith('!/'):
            with self._unprefixed():
                super(SnmsBlueprintSetupState, self).add_url_rule(rule[1:], endpoint, view_func, **options)
        else:
            super(SnmsBlueprintSetupState, self).add_url_rule(rule, endpoint, view_func, **options)


class SnmsBlueprint(Blueprint):
    """A Blueprint implementation that allows prefixing URLs with `!` to
    ignore the url_prefix of the blueprint.

    It also supports automatically creating rules in two versions - with and
    without a prefix.
    """

    def __init__(self, *args, **kwargs):
        self.__virtual_template_folder = kwargs.pop('virtual_template_folder', None)
        super().__init__(*args, **kwargs)

    def make_setup_state(self, app, options, first_registration=False):
        return SnmsBlueprintSetupState(self, app, options, first_registration)


    @contextmanager
    def add_prefixed_rules(self, prefix, default_prefix=''):
        """Creates prefixed rules in addition to the normal ones.
        When specifying a default_prefix, too, the normally "unprefixed" rules
        are prefixed with it."""
        assert self.__prefix is None and not self.__default_prefix
        self.__prefix = prefix
        self.__default_prefix = default_prefix
        yield
        self.__prefix = None
        self.__default_prefix = ''


class SnmsFileSystemLoader(FileSystemLoader):
    """FileSystemLoader that makes namespacing easier.

    The `virtual_path` kwarg lets you specify a path segment that's
    handled as if all templates inside the loader's `searchpath` were
    actually inside ``searchpath/virtual_path``.  That way you don't
    have to create subdirectories in your template folder.
    """

    def __init__(self, searchpath, encoding='utf-8', virtual_path=None):
        super(SnmsFileSystemLoader, self).__init__(searchpath, encoding)
        self.virtual_path = virtual_path

    def list_templates(self):
        templates = super(SnmsFileSystemLoader, self).list_templates()
        if self.virtual_path:
            templates = [os.path.join(self.virtual_path, t) for t in templates]
        return templates

    def get_source(self, environment, template):
        if self.virtual_path:
            if not template.startswith(self.virtual_path):
                raise TemplateNotFound(template)
            template = template[len(self.virtual_path):]
        return super(SnmsFileSystemLoader, self).get_source(environment, template)
