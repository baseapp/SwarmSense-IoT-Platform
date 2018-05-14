from __future__ import unicode_literals

import logging
import os

from celery import Celery
from celery.app.log import Logging
from celery.beat import PersistentScheduler
from celery.signals import before_task_publish
from contextlib2 import ExitStack
from sqlalchemy import inspect
from snms.core.config import config
from snms.core.db import db
from snms.utils.string import return_ascii
from snms.web.stats import request_stats_request_started
from snms.core.signals.celery import process_start


class SnmsCelery(Celery):
    """Celery sweetened with some SNMS/Flask-related sugar

    The following extra params are available on the `task` decorator:

    - `request_context` -- if True, the task will run inside a Flask
                           `test_request_context`
    - `plugin` -- if set to a plugin name or class, the task will run
                  inside a plugin context for that plugin.  This will
                  override whatever plugin context is active when
                  sending the task.
    """

    def __init__(self, *args, **kwargs):
        kwargs.setdefault('log', SnmsCeleryLogging)
        super(SnmsCelery, self).__init__(*args, **kwargs)
        self.flask_app = None  # set from configure_celery
        self._patch_task()

    def init_app(self, app):
        broker_url = config.CELERY_BROKER
        if not broker_url and not app.config['TESTING']:
            raise ValueError('Celery broker URL is not set')
        self.conf['BROKER_URL'] = broker_url
        self.conf['CELERY_RESULT_BACKEND'] = config.CELERY_RESULT_BACKEND or broker_url
        self.conf['CELERYBEAT_SCHEDULER'] = SNMSPersistentScheduler
        self.conf['CELERYBEAT_SCHEDULE_FILENAME'] = os.path.join(config.TEMP_DIR, 'celerybeat-schedule')
        self.conf['CELERYD_HIJACK_ROOT_LOGGER'] = False
        self.conf['CELERY_TIMEZONE'] = config.DEFAULT_TIMEZONE
        self.conf['CELERY_IGNORE_RESULT'] = True
        self.conf['CELERY_STORE_ERRORS_EVEN_IF_IGNORED'] = True
        self.conf['CELERY_REDIRECT_STDOUTS'] = not app.debug
        # Pickle isn't pretty but that way we can pass along all types (tz-aware datetimes, sets, etc.)
        self.conf['CELERY_RESULT_SERIALIZER'] = 'json'
        self.conf['CELERY_TASK_SERIALIZER'] = 'json'
        self.conf.update(config.CELERY_CONFIG)
        assert self.flask_app is None or self.flask_app is app
        self.flask_app = app

    def periodic_task(self, *args, **kwargs):
        """Decorator to register a periodic task.

        This behaves like the :meth:`task` decorator, but automatically
        schedules the task to execute periodically, using extra kwargs
        as described in the Celery documentation:
        http://celery.readthedocs.org/en/latest/userguide/periodic-tasks.html#available-fields

        :param locked: Set this to ``False`` if you want to allow the
                       task to run more than once at the same time.
        """
        def decorator(f):
            entry = {
                'schedule': kwargs.pop('run_every'),
                'args': kwargs.pop('args', ()),
                'kwargs': kwargs.pop('kwargs', {}),
                'options': kwargs.pop('options', {}),
                'relative': kwargs.pop('relative', False)
            }
            kwargs.setdefault('ignore_result', True)
            task = self.task(f, *args, **kwargs)
            entry['task'] = task.name
            self.conf['CELERYBEAT_SCHEDULE'][task.name] = entry
            return task

        return decorator

    def _patch_task(self):
        """Patches the `task` decorator to run tasks inside the snms environment"""
        class SnmsTask(self.Task):
            abstract = True

            def apply_async(s, args=None, kwargs=None, task_id=None, producer=None,
                            link=None, link_error=None, shadow=None, **options):
                if args is not None:
                    args = _CelerySAWrapper.wrap_args(args)
                if kwargs is not None:
                    kwargs = _CelerySAWrapper.wrap_kwargs(kwargs)
                return super(SnmsTask, s).apply_async(args=args, kwargs=kwargs, task_id=task_id, producer=producer,
                                                        link=link, link_error=link_error, shadow=shadow, **options)

            def __call__(s, *args, **kwargs):
                stack = ExitStack()
                stack.enter_context(self.flask_app.app_context())
                if getattr(s, 'request_context', False):
                    stack.enter_context(self.flask_app.test_request_context(base_url=config.BASE_URL))
                args = _CelerySAWrapper.unwrap_args(args)
                kwargs = _CelerySAWrapper.unwrap_kwargs(kwargs)
                with stack:
                    request_stats_request_started()
                    process_start.send()
                    return super(SnmsTask, s).__call__(*args, **kwargs)

        self.Task = SnmsTask


class SnmsCeleryLogging(Logging):
    def _configure_logger(self, logger, *args, **kwargs):
        # don't let celery mess with the root logger
        if logger is logging.getLogger():
            return
        super(SnmsCeleryLogging, self)._configure_logger(logger, *args, **kwargs)


class SNMSPersistentScheduler(PersistentScheduler):
    """Celery scheduler that allows snms.conf to override specific entries"""

    def setup_schedule(self):
        deleted = set()
        for task_name, entry in config.SCHEDULED_TASK_OVERRIDE.items():
            if task_name not in self.app.conf['CELERYBEAT_SCHEDULE']:
                self.logger.error('Invalid entry in ScheduledTaskOverride: %s', task_name)
                continue
            if not entry:
                deleted.add(task_name)
                del self.app.conf['CELERYBEAT_SCHEDULE'][task_name]
            elif isinstance(entry, dict):
                assert entry.get('task') in {None, task_name}  # make sure the task name is not changed
                self.app.conf['CELERYBEAT_SCHEDULE'][task_name].update(entry)
            else:
                self.app.conf['CELERYBEAT_SCHEDULE'][task_name]['schedule'] = entry
        super(SNMSPersistentScheduler, self).setup_schedule()
        self._print_schedule(deleted)

    def _print_schedule(self, deleted):
        pass


class _CelerySAWrapper(object):
    """Wrapper to safely pass SQLAlchemy objects to tasks.

    This is achieved by passing only the model name and its PK values
    through the Celery serializer and then fetching the actual objects
    again when executing the task.
    """
    __slots__ = ('identity_key',)

    def __init__(self, obj):
        self.identity_key = inspect(obj).identity_key
        if self.identity_key is None:
            raise ValueError('Cannot pass non-persistent object to Celery. Did you forget to flush?')

    @property
    def object(self):
        obj = self.identity_key[0].get(self.identity_key[1])
        if obj is None:
            raise ValueError('Object not in DB: {}'.format(self))
        return obj

    @return_ascii
    def __repr__(self):
        model, args = self.identity_key
        return '<{}: {}>'.format(model.__name__, ','.join(map(repr, args)))

    @classmethod
    def wrap_args(cls, args):
        return tuple(cls(x) if isinstance(x, db.Model) else x for x in args)

    @classmethod
    def wrap_kwargs(cls, kwargs):
        return {k: cls(v) if isinstance(v, db.Model) else v for k, v in kwargs.items()}

    @classmethod
    def unwrap_args(cls, args):
        return tuple(x.object if isinstance(x, cls) else x for x in args)

    @classmethod
    def unwrap_kwargs(cls, kwargs):
        return {k: v.object if isinstance(v, cls) else v for k, v in kwargs.items()}
