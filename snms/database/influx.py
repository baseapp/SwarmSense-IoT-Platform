# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Influx DB"""
from influxdb import InfluxDBClient
from influxdb.line_protocol import quote_ident
from snms.core.logger import Logger
from snms.database import TSDBClient

from .exceptions import MeasurementNotFound

_LOGGER = Logger.get()


class InfluxClient(TSDBClient):
    """
    Influx DB time series database for app.
    """

    def __init__(self, app=None):
        super().__init__()
        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        host = app.config['TSDB_HOST']
        port = app.config['TSDB_PORT']
        username = app.config['TSDB_USERNAME']
        password = app.config['TSDB_PASSWORD']
        db = app.config['TSDB_DB']
        self.client = InfluxDBClient(host, port=port, username=username, password=password, database=db)

    def add_point(self, sensor, data, time=None):
        """
        Add new point to database.

        :param time: Time of series
        :param sensor: Sensor
        :param data: Data
        :return:
        """
        try:
            if "last_update" in data.keys():
                del data['last_update']
            json_body = [
                {
                    "measurement": sensor.type,
                    "tags": {
                        "sensor_id": sensor.id,
                        "company_id": sensor.company_id
                    },
                    "fields": data

                }
            ]
            if "data_json" in data.keys():
                json_body[0]['fields'] = data['data_json']
            if 'time' in json_body[0]['fields'].keys():
                time = json_body[0]['fields']['time']
            if time:
                json_body[0]['time'] = time
            self.client.write_points(json_body)
        except Exception as e:
            _LOGGER.error(e)

    def add_series(self, measurement, tags, fields, time=None):
        """
        Add series to database

        :param time: Time of series
        :param measurement: Measurement name
        :param tags: series tags
        :param fields: series data fields
        """
        try:
            json_body = [
                {
                    "measurement": measurement,
                    "tags": tags,
                    "fields": fields
                }
            ]
            if time:
                json_body[0]['time'] = time
            self.client.write_points(json_body)
        except Exception as e:
            _LOGGER.error(e)

    def get_points(self, sensor, limit=10000, order_by=None, start_date=None, end_date=None,
                   duration=None, offset=0, function=None, group_duration=None, aggregate_only=False, value_fields=None):
        """
        Get time series data for sensor.

        :param aggregate_only: Get only aggregated data
        :param group_duration: Group duration
        :param offset: Result offset
        :param end_date: End Date for date filter
        :param start_date: Start Date for date filter
        :param duration: Duration for filter
        :param order_by: Order by
        :param limit: Limit of result
        :param sensor: Sensor
        :return: List of time series data.
        """
        # duration = '1d'
        group_by_clause = None
        order_by_clause = None

        select_clause_min_max = "SELECT MIN(*), MAX(*), MEAN(*), COUNT(*)"
        select_clause = "SELECT *::field"
        select_clause_count = "SELECT COUNT(*)"

        if (duration or start_date or end_date) and group_duration:
            select_clause = "SELECT MEAN(*)"
            group_by_clause = "GROUP BY time({})".format(group_duration)
        from_clause = 'FROM "{}"'.format(sensor.type)
        where_clause = 'WHERE "sensor_id" = \'{}\' '.format(sensor.id)
        if duration:
            where_clause += ' AND time >= now() - ' + duration
        else:
            if start_date:
                where_clause += ' AND time >= \'' + start_date + '\''
            if end_date:
                where_clause += ' AND time <= \'' + end_date + '\''
        if order_by:
            order_by_clause = 'ORDER BY ' + order_by
        limit_clause = 'LIMIT {}'.format(limit)
        offset_clause = 'OFFSET {}'.format(offset)

        min_max_clauses = [select_clause_min_max, from_clause, where_clause, order_by_clause, offset_clause]
        min_max_query = " ".join(filter(None, min_max_clauses))
        min_max_result = self.client.query(min_max_query)
        aggregate = None
        try:
            _points = list(min_max_result.get_points())
            if len(_points) > 0:
                aggregate = _points[0]
        except Exception as e:
            _LOGGER.error(e)
        if aggregate_only:
            return aggregate

        count_clauses = [select_clause_count, from_clause, where_clause, order_by_clause]
        all_clauses = [select_clause, from_clause, where_clause, group_by_clause, order_by_clause, limit_clause, offset_clause]

        base_query = " ".join(filter(None, all_clauses))
        base_count_query = " ".join(filter(None, count_clauses))
        _LOGGER.debug(min_max_query)
        _LOGGER.debug(base_query)
        _LOGGER.debug(base_count_query)

        result = self.client.query(base_query+";"+base_count_query)
        points = list(result[0].get_points())
        count_result = result[1]

        count = 0
        if len(points) > 0:
            try:
                for k in count_result.raw['series'][0]['values'][0]:
                    if type(k) is int and count < k:
                        count = k
            except Exception as e:
                _LOGGER.error(e)
                count = len(points)

        return {'data': points, 'total': count, 'aggregate': aggregate}

    def get_points_raw(self, measurement, tags=None, fields=None, limit=500, order_by=None, start_date=None,
                       end_date=None, duration=None, offset=0, count_only=False, group_by=None):
        """
        Get time series data for sensor.

        :param group_by: Group By data
        :param count_only: Count only query
        :param offset: Result offset
        :param fields: Measurement Fields
        :param tags: Measurement tags
        :param end_date: End Date for date filter
        :param start_date: Start Date for date filter
        :param duration: Duration for filter
        :param order_by: Order by
        :param limit: Limit of result
        :param measurement: Measurement
        :return: List of time series data.
        """
        from_clause = 'FROM '
        if isinstance(measurement, list):
            if len(measurement) > 0:
                from_clause += '"' + '","'.join(measurement) + '"'
            else:
                return {'data': [], 'total': 0}
        else:
            from_clause += '"' + measurement + '"'
        query = 'SELECT * {} '.format(from_clause)
        count_query = 'SELECT COUNT(*) {} '.format(from_clause)
        where_query = ''
        where_parts = []
        if tags:
            checks = []
            for key in tags.keys():
                checks.append(' "{}" = \'{}\' '.format(key, tags[key]))
            where_parts.append(' And '.join(checks))
        if duration:
            where_parts.append(' time >= now() - ' + duration)
        else:
            if start_date:
                where_parts.append(' time >= \'' + start_date + '\'')
            if end_date:
                where_parts.append(' time <= \'' + end_date + '\'')
        if len(where_parts) > 0:
            where_query = ' WHERE '
            where_query += ' AND '.join(where_parts)

        if count_only and group_by:
            where_query += ' GROUP BY "' + group_by + '" '

        if order_by:
            where_query += ' ORDER BY ' + order_by
        count_query += where_query
        _LOGGER.debug(count_query)
        # TODO: Add exception handling
        count_result = self.client.query(count_query)
        _LOGGER.debug(count_result.raw)
        points = []
        if count_only:
            points = list(count_result.get_points())
        else:
            query = query + where_query + ' LIMIT {} OFFSET {}'.format(limit, offset)
            _LOGGER.debug(query)
            result = self.client.query(query)
            # print(result)
            points = list(result.get_points())

        total_count = 0
        try:
            if 'series' not in count_result.raw.keys():
                return {'data': points, 'total': total_count}
            for series in count_result.raw['series']:
                count = 0
                for k in series['values'][0]:
                    if type(k) is int and count < k:
                        count = k
                total_count += count
        except Exception as e:
            _LOGGER.error(e)
            total_count = len(points)

        return {'data': points, 'total': total_count}

    def delete_measurement(self, measurement):
        """Delete a measurement."""
        try:
            self.client.query("DROP MEASUREMENT {0}".format(quote_ident(measurement)))
        except Exception as e:
            raise MeasurementNotFound(e)

    def restart(self):
        return