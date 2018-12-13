# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from flask_pluginengine import (Plugin, PluginBlueprintMixin, PluginBlueprintSetupStateMixin, PluginEngine,
                                current_plugin, wrap_in_plugin_context)

from snms.core import signals
from snms.core.db import db
from snms.core.db.sqlalchemy.util.models import import_all_models
from snms.core.logger import Logger
from snms.utils.decorators import classproperty
from snms.web.util import _url_for as url_for
from snms.web.wrappers import SnmsBlueprint, SnmsBlueprintSetupState


class SwarmSensePlugin(Plugin):
    """Base Class for SwarmSense Plugins
    """

    def init(self):
        self.connect(signals.core.get_blueprints, lambda app: self.get_blueprints())
        self._import_models()

    def _import_models(self):
        old_models = set(db.Model._decl_class_registry.items())
        import_all_models(self.package_name)
        added_models = set(db.Model._decl_class_registry.items()) - old_models
        # Ensure that only plugin schemas have been touched. It would be nice if we could actually
        # restrict a plugin to plugin_PLUGNNAME but since we load all models from the plugin's package
        # which could contain more than one plugin this is not easily possible.
        for name, model in added_models:
            schema = model.__table__.schema
            # print(schema)
            # if not schema.startswith('plugin_'):
            #     raise Exception("Plugin '{}' added a model which is not in a plugin schema ('{}' in '{}')"
            #                     .format(self.name, name, schema))

    def connect(self, signal, receiver, **connect_kwargs):
        connect_kwargs['weak'] = False
        func = wrap_in_plugin_context(self, receiver)
        func.snms_plugin = self
        signal.connect(func, **connect_kwargs)

    def get_blueprints(self):
        """Return blueprints to be registered on the application
        A single blueprint can be returned directly, for multiple blueprint you need
        to yield them or return an iterable.
        """
        pass

    @classproperty
    @classmethod
    def logger(cls):
        return Logger.get('plugin.{}'.format(cls.name))


def url_for_plugin(endpoint, *targets, **values):
    """Like :func:`~indico.web.flask.util.url_for` but prepending ``'plugin_'`` to the blueprint name."""
    if '.' in endpoint[1:]:  # 'foo' or '.foo' should not get the prefix
        endpoint = 'plugin_{}'.format(endpoint)
    return url_for(endpoint, *targets, **values)


class SwarmSensePluginEngine(PluginEngine):
    plugin_class = SwarmSensePlugin


class SwarmSensePluginBlueprintSetupState(PluginBlueprintSetupStateMixin, SnmsBlueprintSetupState):
    def add_url_rule(self, rule, endpoint=None, view_func=None, **options):
        if rule.startswith('/static'):
            with self._unprefixed():
                super(SwarmSensePluginBlueprintSetupState, self).add_url_rule(rule, endpoint, view_func, **options)
        else:
            super(SwarmSensePluginBlueprintSetupState, self).add_url_rule(rule, endpoint, view_func, **options)


class SwarmSensePluginBlueprint(PluginBlueprintMixin, SnmsBlueprint):
    """The Blueprint class all plugins need to use.
    It contains the necessary logic to run the blueprint's view
    functions inside the correct plugin context and to make the
    static folder work.
    """

    def make_setup_state(self, app, options, first_registration=False):
        return SwarmSensePluginBlueprintSetupState(self, app, options, first_registration)

plugin_engine = SwarmSensePluginEngine()