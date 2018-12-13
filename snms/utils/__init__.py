# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

import json
from flask_restful import reqparse
from snms.core.logger import Logger

from snms.core.exceptions import ValidationError

_LOGGER = Logger.get()


def get_filters(in_request, sort_by=None, order_type="ASC", limit=10000):
    """
    Get the query filters to sort and filter the result in GET_LIST request.

    :param limit:
    :param order_type:
    :param in_request: Flask request
    :param sort_by:
    :return:
    """
    order_by = "id"
    if sort_by:
        order_by = sort_by
    offset = 0
    filters = {}
    try:
        parser = reqparse.RequestParser()
        parser.add_argument("order_by", type=str, location='args')
        parser.add_argument("order", type=str, location='args')
        parser.add_argument("sort", type=str, location='args')
        parser.add_argument("filter", type=str, location='args', default="{}")
        parser.add_argument("range", type=str, location='args')
        args = parser.parse_args(req=in_request)
        print(args)
        if args['sort']:
            sort = args['sort']
            if sort[0] in ['-', '+']:
                order_by = sort[1:]
                if sort[0] == '+':
                    order_type = "ASC"
                else:
                    order_type = "DESC"
            else:
                order_by = json.loads(args['sort'])[0]
                order_type = json.loads(args['sort'])[1]
                if order_type not in ['ASC', 'DESC']:
                    order_type = 'DESC'
                # NOTE: Postgres Specific NULLS LAST (http://docs.sqlalchemy.org/en/latest/core/sqlelement.html#sqlalchemy.sql.expression.nullslast).
                if order_type in ['desc', 'DESC']:
                    order_type = 'DESC NULLS LAST'
        if args['range']:
            offset = json.loads(args['range'])[0]
            end = json.loads(args['range'])[1]
            limit = end+1-offset
        else:
            limit = int(in_request.args.get('limit', limit))
            page = int(in_request.args.get('page', 1))
            offset = (page - 1) * limit
        filters = json.loads(args['filter'])
    except Exception as e:
        # TODO: Add logging.
        _LOGGER.error("Filter parsing error : %s", e)
    return order_by, order_type, offset, limit, filters
