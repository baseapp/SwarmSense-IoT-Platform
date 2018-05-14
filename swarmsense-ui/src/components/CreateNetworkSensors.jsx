/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import {
  Create,
  SimpleForm,
  ReferenceInput,
  SelectArrayInput
} from "admin-on-rest";
import { connect } from "react-redux";
import LinearProgress from "material-ui/LinearProgress";
import { Card, CardText, CardTitle } from "material-ui/Card";
import { set_params, resolveIfNetwork } from "../utils";
import InjectParams from "./InjectParams";
import Forwarder from "./Forwarder";
function NetworkSensorsCreate(props) {
  let title = "Assign sensors to network",
    reference_label = "Sensors",
    reference_source = "sensor_ids",
    reference = "company_sensors";
  if (props.network_alerts) {
    // can be used to set params
    title = "Assign alerts to the network";
    reference_label = "Alerts";
    reference_source = "alert_ids";
    reference = "company_alerts";
  }
  return (
    <Create {...props} title={title}>
      <SimpleForm redirect="list">
        <ReferenceInput
          label={reference_label}
          source={reference_source}
          reference={reference}
          allowEmpty
          perPage={1000}
        >
          <SelectArrayInput
            optionText="name"
            optionValue="id"
            options={{ maxSearchResults: 10 }}
          />
        </ReferenceInput>
      </SimpleForm>
    </Create>
  );
}
export default /**
 * @name NetworkSensorsCreates
 * @description A react functional component to render form for
 * assigning sensors to network(if props.nid is set) and
 * assign alerts to the network(if props.network_alerts is set).
 * @example <NetworkSensorsCreate/>
 *
 */
props => (
  <InjectParams
    resolve={resolveIfNetwork}
    OnResolveFail={
      <Forwarder to="/company_networks" message="Network not found" />
    }
  >
    <NetworkSensorsCreate {...props} />
  </InjectParams>
);
