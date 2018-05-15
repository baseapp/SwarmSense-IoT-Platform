# SwarmSense IoT Platform

![SwarmSense IoT Platform](https://raw.github.com/baseapp/SwarmSense-IoT-Platform/master/docs/screenshots.png)

SwarmSense Installation On Production Server
============================================

SwarmSense setup is really easy. It comes with one-click installer script
which will take-care of every dependency of the application.

Download the `swarmsense.tar.gz` from the [latest release](https://github.com/baseapp/SwarmSense-IoT-Platform/releases).
In the `swarmsense.tar.gz`, you will get a zip file `snms.zip` of the application. First of all you have
to install unzip:

    $ apt-get update
    $ apt-get install unzip

Now extract the zip file

    $ unzip snms.zip

It will create a folder named release. Installation script for the application
setup.sh is under `release/script` directory. Run this file to start application
installation:

    $ cd release/script
    $ sh setup.sh

Note: Run all the above commands with root privileges.

After running `$ sh setup.sh` it will install nginx, postfix, rabbitmq, postgres,
influxdb etc.


After finishing the installation `/etc/snms.conf` configuration will be created.
This file has all the application configurations. This file will be interpreted
as a python file so all the variables will be written in python style.

All the application related files logs will be at `/opt/snms` directory.

Checkout Here for more details about installation:
https://www.baseapp.com/swarmsense/swarmsense-installation-guide/
