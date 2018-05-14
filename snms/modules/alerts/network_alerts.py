# This file is part of SwarmSense IoT Platform
# Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
# Authors: Gopal Lal
#
# License: www.baseapp.com/swarmsense-whitelabel-iot-platoform

"""Network Alert Resources"""

from functools import wraps
from flask import g, request
from flask_restful import Resource
from werkzeug.exceptions import Forbidden, NotFound

from snms.core.db import db
from snms.core.logger import Logger
from snms.modules.companies import Company, company_required
from snms.modules.networks import Network
from snms.modules.alerts import Alert, AlertSchema, NetworkAlertAssociation
from snms.common.auth import login_required
from snms.modules.networks.controllers import network_required

_LOGGER = Logger.get()


class NetworkAlertResource(Resource):
    """Network Alert Resource"""
    method_decorators = [network_required, company_required, login_required]

    def get(self, company_id, network_id):
        """Get All alerts associated with the network"""
        network = Network.query.filter(Network.uid == network_id).filter(Network.deleted == False).first()
        result_alerts = []
        for alert_ass in network.alerts:
            if not alert_ass.alert.deleted:
                result_alerts.append(alert_ass.alert)
        return AlertSchema(many=True).dump(result_alerts)

    def post(self, company_id, network_id):
        """Add attach a new alert to a network."""
        data = request.json
        network = Network.query.filter(Network.uid == network_id).filter(Network.deleted == False).first()
        try:
            existing_alert_ids = [a.alert_id for a in NetworkAlertAssociation.query.filter(
                NetworkAlertAssociation.network_id == network.id)]
            alerts = Alert.query.filter(Alert.company_id == network.company_id).\
                filter(Alert.uid.in_(data["alert_ids"])).\
                filter(~Alert.id.in_(existing_alert_ids)).\
                filter(Alert.deleted == False)
            for alert in alerts:
                assoc = NetworkAlertAssociation(network_id=network.id, alert_id=alert.id)
                db.session.add(assoc)
            db.session.commit()
            return {}
        except Exception as e:
            _LOGGER.error(e)
            return {}, 500

    def delete(self, company_id, network_id):
        """Remove alerts form the network"""
        data = request.json
        network = Network.query.filter(Network.uid == network_id).filter(Network.deleted == False).first()
        try:
            existing_alert_ids = [a.id for a in Alert.query.filter(Alert.uid.in_(data["alert_ids"]))]
            r = NetworkAlertAssociation.query.filter(NetworkAlertAssociation.network_id == network.id).\
                filter(NetworkAlertAssociation.alert_id.in_(existing_alert_ids)).\
                delete(synchronize_session=False)
            db.session.commit()
            return {"deleted_rows": r}
        except Exception as e:
            _LOGGER.error(e)
            return {}, 500
