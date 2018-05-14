/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import PropTypes from "prop-types";
import { DeleteMulti } from "./index";
import { resolveIfNetwork } from "../utils";
import Forwarder from "./Forwarder";
import InjectParams from "./InjectParams";

class NetworkSensorsDelete extends React.Component {
  render() {
    let { network: { id: nid }, global_company: { id: cid } } = this.props;
    if (!nid) {
      return <div>Network not found</div>;
    }
    let label = "sensors",
      source = "sensor_ids",
      reference = `companies/${cid}/networks/${nid}/sensors`,
      optionText = "name",
      optionValue = "id",
      title = "Remove sensors from network",
      deleteUrl = `companies/${cid}/networks/${nid}/sensors`;
    if (this.props.network_alerts) {
      //set params if required
      // set_params("company_network_alerts", {
      //   cid,
      //   nid
      // });
      label = "alerts";
      source = "alert_ids";
      reference = "company_network_alerts";
      optionText = "name";
      optionValue = "id";
      title = "Remove alerts from network";
      deleteUrl = "company_network_alerts";
    } else {
      //set params if required
    }
    return (
      <DeleteMulti
        label={label}
        source={source}
        reference={reference}
        optionText={optionText}
        optionValue={optionValue}
        title={title}
        deleteUrl={deleteUrl}
        onCancel={() => this.context.router.history.goBack()}
      />
    );
  }
}
NetworkSensorsDelete.contextTypes = {
  router: PropTypes.object
};
export default /**
 * @name NetworkSensorsDelete
 * @description A react component to remove the sensors and alerts from the network
 * @example <NetworkSensorsDelete/>
 */
props => (
  <InjectParams
    resolve={resolveIfNetwork}
    OnFailResolve={
      <Forwarder to="/company_network_sensors" message="Network not found!" />
    }
  >
    <NetworkSensorsDelete {...props} />
  </InjectParams>
);
