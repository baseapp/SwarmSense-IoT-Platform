# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Cassandra DB"""
from cassandra.cluster import Cluster
from cassandra.query import SimpleStatement
from snms.core.logger import Logger
from snms.database import TSDBClient

from .exceptions import MeasurementNotFound

from datetime import datetime, timezone
import pandas as pd

_LOGGER = Logger.get()


class CassandraClient(TSDBClient):
    """
    Cassandra time series database for app.
    """

    def __init__(self, app=None):
        super().__init__()
        self.keyspace = None
        self.cluster = None
        self.client = None
        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        self.app = app
        self.start(app=app)

    def start(self, app):
        host = app.config['TSDB_HOST']
        self.keyspace= app.config['TSDB_DB']
        self.cluster = Cluster([host])
        self.client = self.cluster.connect(self.keyspace)
        _LOGGER.debug("Cassandra Client started")

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

            if "data_json" in data.keys():
                data = data['data_json']
            # self.client.write_points(json_body)
            data["sensor_id"] = sensor.id
            data["company_id"] = sensor.company_id
            data["time"] = datetime.utcnow()
            query = """
                INSERT INTO {} ({})
                VALUES ({})
                """.format(sensor.type, ', '.join(data.keys()), ', '.join(["%s"] * len(data.keys())))
            _LOGGER.debug(query)
            self.client.execute(query, (data.values()))
        except Exception as e:
            # TODO: Check for other Exceptions
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
            fields.update(tags)
            fields['time'] = datetime.utcnow()

            if time:
                fields['time'] = time
            query = """
                INSERT INTO {} ({})
                VALUES ({})
                """.format(measurement, ', '.join(fields.keys()), ', '.join(["%s"] * len(fields.keys())))
            _LOGGER.debug(query)
            self.client.execute(query, (fields.values()))
        except Exception as e:
            # TODO: Check for other Exceptions
            _LOGGER.error(e)

    def get_points(self, sensor, limit=5000, order_by=None, start_date=None, end_date=None,
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

        select_clause_min_max = "SELECT MIN(*), MAX(*), MEAN(*)"
        select_clause = "SELECT * "
        if value_fields:
            select_clause = "SELECT {}, time ".format(', '.join(list(value_fields.keys())))
        select_clause_count = "SELECT COUNT(*)"

        # if (duration or start_date or end_date) and group_duration:
        #     select_clause = "SELECT MEAN(*)"
        #     group_by_clause = "GROUP BY time({})".format(group_duration)
        from_clause = 'FROM "{}"'.format(sensor.type)
        where_clause = 'WHERE sensor_id = {} '.format(sensor.id)
        # TODO: Add time duration support
        # if duration:
        if False:
            where_clause += ' AND time >= now() - ' + duration
        else:
            if start_date:
                where_clause += ' AND time >= \'' + start_date + '\''
            if end_date:
                where_clause += ' AND time <= \'' + end_date + '\''
        # if order_by:
        #     order_by_clause = 'ORDER BY ' + order_by
        limit_clause = 'LIMIT {}'.format(limit + offset)
        # offset_clause = 'OFFSET {}'.format(offset)

        # TODO: Aggregate Data Query
        min_max_clauses = [select_clause_min_max, from_clause, where_clause, order_by_clause]
        min_max_query = " ".join(filter(None, min_max_clauses))
        # TODO: Include Aggregate data to normal request also
        if aggregate_only:
            min_max_result = self.client.execute(min_max_query)
            return list(min_max_result.get_points())[0]

        # count_clauses = [select_clause_count, from_clause, where_clause, group_by_clause, order_by_clause, limit_clause, offset_clause]
        count_clauses = [select_clause_count, from_clause, where_clause, order_by_clause]
        all_clauses = [select_clause, from_clause, where_clause, group_by_clause, order_by_clause, limit_clause]
        paginate_clauses = [select_clause, from_clause, where_clause, group_by_clause, order_by_clause]

        base_query = " ".join(filter(None, all_clauses))
        base_count_query = " ".join(filter(None, count_clauses))
        paginate_query = " ".join(filter(None, paginate_clauses))

        _LOGGER.info(min_max_query)
        _LOGGER.info(base_query)
        _LOGGER.info(base_count_query)
        _LOGGER.info(paginate_query)

        # result = self.client.query(base_query+";"+base_count_query)
        # TODO: Pagination Support
        # points = self.client.execute(base_query)
        count_result = self.client.execute(base_count_query)
        # points = list(result[0].get_points())
        # count_result = result[1]

        statement = SimpleStatement(paginate_query, fetch_size=1000)
        count = 0
        data = []
        index = 0
        count = count_result[0].count
        for row in self.client.execute(statement):
            index += 1
            if group_duration or (offset < index < offset + limit + 1):
                d = row._asdict()
                d['time'] = str(d['time'].replace(tzinfo=timezone.utc))
                data.append(d)
        # TODO: Get all data for grouping
        if group_duration and len(data) > 0:
            group_duration = group_duration.replace('ms', 'S')
            group_duration = group_duration.replace('m', 'T')
            group_duration = group_duration.replace('s', 'S')
            r = pd.DataFrame(data)
            r = r.set_index('time')
            r.index = pd.to_datetime(r.index)
            print(r)
            a = r.resample(group_duration).mean().fillna('null')
            # TODO: Time Format
            a['time'] = a.index.strftime("%Y-%m-%dT%H:%M:%SZ")
            data = a.to_dict('records')
            count = len(data)
        return {'data': data, 'total': count}

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
        :return: List of time series data and count.
        """
        from_clause = 'FROM '
        if isinstance(measurement, list):
            return {'data': [], 'total': 0}
        else:
            from_clause += measurement
        query = 'SELECT * {} '.format(from_clause)
        count_query = 'SELECT COUNT(*) {} '.format(from_clause)
        where_query = ''
        where_parts = []
        if tags:
            checks = []
            for key in tags.keys():
                if type(tags[key]) == str:
                    checks.append(" {} = '{}' ".format(key, tags[key]))
                else:
                    checks.append(" {} = {} ".format(key, tags[key]))
            where_parts.append(' AND '.join(checks))
        if start_date:
            where_parts.append(' time >= \'' + start_date + '\'')
        if end_date:
            where_parts.append(' time <= \'' + end_date + '\'')
        if len(where_parts) > 0:
            where_query = ' WHERE '
            where_query += ' AND '.join(where_parts)

        count_query += where_query
        count_query += " ALLOW FILTERING"
        _LOGGER.debug(count_query)
        # TODO: Add exception handling
        count_result = self.client.execute(count_query)

        total_count = 0
        data = []
        total_count = count_result[0].count
        if count_only:
            data = []
        else:
            paginate_query = query + where_query + " ALLOW FILTERING"
            statement = SimpleStatement(paginate_query, fetch_size=1000)
            data = []
            index = 0
            for row in self.client.execute(statement):
                index += 1
                if offset < index < offset + limit + 1:
                    d = row._asdict()
                    d['time'] = str(d['time'].replace(tzinfo=timezone.utc))
                    data.append(d)
        return {'data': data, 'total': total_count}

    def delete_measurement(self, measurement):
        """Delete a measurement."""
        return

    def create_sensor(self, sensor_type, value_fields):
        """Create a new table for each sensor type"""
        create_cmd = "CREATE TABLE IF NOT EXISTS {} ( company_id int, sensor_id int, {}, time timestamp, PRIMARY KEY (sensor_id, time)) WITH CLUSTERING ORDER BY (time DESC)"
        columns = []
        for name in value_fields.keys():
            columns.append("{} {}".format(name, get_cassandra_data_type(value_fields[name]['type'])))
        try:
            cmd = create_cmd.format(sensor_type, ", ".join(columns))
            _LOGGER.debug(cmd)
            self.client.execute(cmd)
        except Exception as e:
            # TODO: Check for other Exceptions
            _LOGGER.error(e)

    def delete_sensor(self, sensor_type):
        # TODO: Implement
        pass

    def update_sensor(self, sensor_type, new_fields, updated_fields):
        # TODO: Implement
        pass

    def restart(self):
        if self.client is not None:
            self.client.shutdown()
        self.start(self.app)

    def create_defaults(self):
        """Create Default tables"""
        event_logs_cmd = "CREATE TABLE IF NOT EXISTS event_logs (user_id varchar,company_id varchar,sensor_id varchar," \
                         "alert_id varchar, network_id varchar, event_id varchar, user text, ip_addr text," \
                         "log text,time timestamp,PRIMARY KEY (company_id, time))WITH CLUSTERING ORDER BY (time DESC)"

        alert_history_cmd = "CREATE TABLE IF NOT EXISTS alert_history (company_id varchar,sensor_id varchar,alert_id varchar," \
                            "alert_text text,alert_name text,sensor_name text,time timestamp,PRIMARY KEY ((company_id), time))WITH CLUSTERING ORDER BY (time DESC)"

        event_history_cmd = "CREATE TABLE IF NOT EXISTS event_history (company_id varchar,sensor_id varchar,event_id varchar," \
                            "event_name text,sensor_name text,time timestamp,PRIMARY KEY ((company_id, event_id), time))" \
                            "WITH CLUSTERING ORDER BY (time DESC)"

        system_daily_analytics_cmd = "CREATE TABLE IF NOT EXISTS system_daily_analytics (company_id varchar," \
                                     "active_sensors int, message_count int,period varchar,series_type varchar," \
                                     "time timestamp,PRIMARY KEY (company_id, time))WITH CLUSTERING ORDER BY (time DESC)"

        self.client.execute(event_logs_cmd)
        self.client.execute(alert_history_cmd)
        self.client.execute(event_history_cmd)
        self.client.execute(system_daily_analytics_cmd)



def get_cassandra_data_type(_t):
    if _t in ["longitude", "latitude", "float", "temperature", "decimal"]:
        return "double"
    else:
        return "text"