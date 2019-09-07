# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Setup application"""

from setuptools import setup, find_packages

PACKAGES = find_packages(exclude=['tests', 'tests.*'])
version = __import__('snms').get_version()
setup(
    name='snms',
    version=version,
    author='BaseApp Systems',
    author_email='gopal@baseapp.com',
    packages=PACKAGES,
    include_package_data=True,
    install_requires=[
        'flask',
    ],
    entry_points={
        'console_scripts': {'snms = snms.cli.core:cli'},
        'pytest11': {'snms = snms.testing.pytest_plugin'},
    },
)