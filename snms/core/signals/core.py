# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from blinker import Namespace


_signals = Namespace()


app_created = _signals.signal('app-created', """
Called when the application has been created. The *sender* is the flask app.
""")

import_tasks = _signals.signal('import-tasks', """
Called when Celery needs to import all tasks. Use this signal if you
have modules containing task registered using one of the Celery
decorators but don't import them anywhere.  The signal handler should
only ``import`` these modules and do nothing else.
""")

after_process = _signals.signal('after-process', """
Called after an SNMS request has been processed.
""")

model_committed = _signals.signal('model-committed', """
Triggered when an SNMS Model class was committed.  The *sender* is
the model class, the model instance is passed as `obj` and the
change type as a string (delete/insert/update) in the `change` kwarg.
""")

db_schema_created = _signals.signal('db-schema-created', """
Executed when a new database schema is created.  The *sender* is the
name of the schema.
""")

settings_changed = _signals.signal('settings-changed', """
Executed when settings are changed.
""")

get_storage_backends = _signals.signal('get-storage-backends', """
Expected to return one or more Storage subclasses.
""")

get_blueprints = _signals.signal('get-blueprints', """
Expected to return one or more SwarmSensePluginBlueprint-based blueprints
which will be registered on the application. The Blueprint must be named
either *PLUGINNAME* or *compat_PLUGINNAME*.
""")