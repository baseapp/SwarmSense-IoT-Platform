from __future__ import unicode_literals

import logging
import os
import re
import sys
import tempfile

import py


# Ignore config file in case there is one
os.environ['SNMS_CONFIG'] = os.devnull

pytest_plugins = ('snms.testing.fixtures.app', 'snms.testing.fixtures.database',
                  'snms.testing.fixtures.disallow', 'snms.testing.fixtures.user',
                  'snms.testing.fixtures.smtp',
                  'snms.testing.fixtures.util')


def pytest_configure(config):
    # Load all the plugins defined in pytest_plugins
    config.pluginmanager.consider_module(sys.modules[__name__])
    config.snms_temp_dir = py.path.local(tempfile.mkdtemp(prefix='snmstesttmp.'))

    assert not logging.root.handlers
    logging.root.addHandler(logging.NullHandler())
    # Silence the annoying pycountry logger
    logging.getLogger('pycountry.db').addHandler(logging.NullHandler())


def pytest_unconfigure(config):
    config.snms_temp_dir.remove(rec=True)


def pytest_addoption(parser):
    parser.addini('snms_plugins', 'List of snms plugins to load')
