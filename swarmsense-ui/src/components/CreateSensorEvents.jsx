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
import { resolveIfSensor } from "../utils";
import { getSensorInfo } from "../rest";
import InjectParams from "./InjectParams";
import Forwarder from "./Forwarder";

/**
 * Makes a form for "creating sensor event"
 */

class CreateSensorEvents extends React.Component {
  render() {
    let { sensor: { type: sensor_type } } = this.props;
    return (
      <Create
        {...this.props}
        title="Update Sensor Events (Select new events for sensor!)"
      >
        <SimpleForm redirect="list">
          <ReferenceInput
            label="Events"
            source="event_ids"
            reference="events"
            allowEmpty
            filter={{ actuator_type: sensor_type }}
            filterToQuery={searchText => ({ actuator_type: searchText })}
          >
            <SelectArrayInput optionText="name" optionValue="id" />
          </ReferenceInput>
        </SimpleForm>
      </Create>
    );
  }
}
export default props => (
  <InjectParams
    resolve={resolveIfSensor}
    OnFailResolve={
      <Forwarder to="/company_sensor" message="Sensor not found" />
    }
  >
    <CreateSensorEvents {...props} />
  </InjectParams>
);
