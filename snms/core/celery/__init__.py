# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

from __future__ import unicode_literals

from celery.signals import import_modules, worker_process_init, beat_init
from flask import session

from snms.core import signals
from snms.database import tsdb
from .core import SnmsCelery


__all__ = ('celery',)


def cassandra_init(**kwargs):
    """ Initialize a clean Cassandra connection. """
    tsdb.restart()

worker_process_init.connect(cassandra_init)
beat_init.connect(cassandra_init)

#: The Celery instance for all SNMS tasks
celery = SnmsCelery('snms')


@signals.app_created.connect
def _load_default_modules(app, **kwargs):
    celery.loader.import_default_modules()  # load all tasks


@import_modules.connect
def _import_modules(*args, **kwargs):
    import snms.tasks
    signals.import_tasks.send()
