# SwarmSense IoT Platform

![SwarmSense IoT Platform](https://raw.github.com/baseapp/SwarmSense-IoT-Platform/master/docs/screenshots.png)

SwarmSense Installation On Production Server
============================================

SwarmSense setup is really easy. It comes with one-click installer script
which will take-care of every dependency of the application.

You will get a zip file snms.zip of the application. First of all you have
to install unzip:

    $ apt-get update
    $ apt-get install unzip

Now extract the zip file

    $ unzip snms.zip

It will create a folder named release. Installation script for the application
setup.sh is under release/script directory. Run this file to start application
installation:

    $ cd release/script
    $ sh setup.sh

Note: Run all the above commands with root privileges.

After running $ sh setup.sh it will install nginx, postfix, rabbitmq, postgres,
influxdb etc.


After finishing the installation /etc/snms.conf configuration will be created.
This file has all the application configurations. This file will be interpreted
as a python file so all the variables will be written in python style.

All the application related files logs will be at /opt/snms directory.

Checkout Here for more details about installation:
https://www.baseapp.com/swarmsense/swarmsense-installation-guide/

SwarmSense Development
======================

System Requirements
-------------------
 * Python3.4
 * pip3
 * PostgreSQL
 * InfluxDB
 * RabbitMQ

Database Setup
--------------

We are using **PostgreSQL** for database. To install and setup use following instructions https://www.postgresql.org/download/linux/ubuntu/

For Ubuntu 16.04

Create the file /etc/apt/sources.list.d/pgdg.list, and add a line for the repository::

    deb http://apt.postgresql.org/pub/repos/apt/ xenial-pgdg main

Import the repository signing key, and update the package lists::

    $ wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
    $ sudo apt-get update

Now install::

    $ sudo apt-get install postgresql-9.4


Time Series Database
--------------------

We are using *InfluxDB* to store time-series data.
Follow the instructions here to setup database: https://docs.influxdata.com/influxdb/v1.2/introduction/installation/

RabbitMQ
--------
RabbitMQ is being used as MQTT broker and Celery backend.

    $ export RABBITMQ_VERSION=3.6.12
    $ export RABBITMQ_GITHUB_TAG=rabbitmq_v3_6_12
    $ export RABBITMQ_DEBIAN_VERSION=3.6.12-1
    $ sudo apt-get install -y  erlang-asn1 erlang-crypto erlang-eldap erlang-inets erlang-mnesia erlang-nox erlang-os-mon erlang-public-key erlang-ssl erlang-xmerl socat
    $ sudo wget -O rabbitmq-server.deb.asc "https://github.com/rabbitmq/rabbitmq-server/releases/download/$RABBITMQ_GITHUB_TAG/rabbitmq-server_${RABBITMQ_DEBIAN_VERSION}_all.deb.asc"
    $ sudo wget -O rabbitmq-server.deb     "https://github.com/rabbitmq/rabbitmq-server/releases/download/$RABBITMQ_GITHUB_TAG/rabbitmq-server_${RABBITMQ_DEBIAN_VERSION}_all.deb"
    $ sudo dpkg -i rabbitmq-server.deb
    $ sudo rm -f rabbitmq-server.deb*
    

App Setup
---------

Install python requirements::

    $ pip3 install -r requirements.txt
    
