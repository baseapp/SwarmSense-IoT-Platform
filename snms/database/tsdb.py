# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Time Series database"""


class TSDBClient:
    def __init__(self):
        pass

    def factory(type):
        if type == 'cassandra':
            from .cassandra_client import CassandraClient
            return CassandraClient()
        if type == 'influx':
            from .influx import InfluxClient
            return InfluxClient()
        assert 0, "Invalid time series database client type: " + type

    factory = staticmethod(factory)

    def init_app(self, app):
        raise NotImplementedError("Subclass must implement abstract method")

    def add_point(self, sensor, data):
        raise NotImplementedError("Subclass must implement abstract method")

    def add_series(self, measurement, tags, fields, **kwargs):
        raise NotImplementedError("Subclass must implement abstract method")

    def get_points(self, sensor, **kwargs):
        raise NotImplementedError("Subclass must implement abstract method")

    def delete_sensor_type(self, type):
        pass

    def create_sensor(self, sensor_type, value_fields):
        pass

    def restart(self):
        pass

    def create_defaults(self):
        pass

    def delete_points(self, **kwargs):
        pass


class TSDB:
    """Time series database Class"""

    def __init__(self):
        self.client = None
        self.logger = None

    def init_app(self, app):
        """
        Init database with application.

        :param app: Flask application
        """
        # if app.config['TSDB_CLIENT'] == 'influx':
        # from .influx import InfluxClient
        from .cassandra_client import CassandraClient
        self.client = CassandraClient(app)

    def add_point(self, sensor, data):
        """
        Add new point to database.

        :param sensor: Sensor
        :param data: Data
        :return:
        """
        return self.client.add_point(sensor, data)

    def add_series(self, measurement, tags, fields, **kwargs):
        """
        Add new point to database.

        :return:
        """
        return self.client.add_series(measurement, tags, fields, **kwargs)

    def get_points(self, sensor, **kwargs):
        """
        Get sensor readings from database.

        :param start_date: Start Date of date range
        :param end_date: End Date of date range
        :param sensor: Sensor
        """
        return self.client.get_points(sensor, **kwargs)

    def get_points_raw(self, measurement, **kwargs):
        """
        Get sensor readings from database.

        :param measurement: Measurement
        """
        return self.client.get_points_raw(measurement, **kwargs)

    def delete_sensor_type(self, type):
        """Delete a series on deletion of a sensor type."""
        self.client.delete_measurement(type)

    def create_sensor(self, sensor_type, value_fields):
        self.client.create_sensor(sensor_type, value_fields)

    def delete_points(self, **kwargs):
        """
        Delete from database.

        :param start_date: Start Date of date range
        :param end_date: End Date of date range
        :param sensor: Sensor
        """
        return self.client.delete_points(**kwargs)

    def restart(self):
        self.client.restart()