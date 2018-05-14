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
import { resolveIfSensor } from "../utils";
import Forwarder from "./Forwarder";
import InjectParams from "./InjectParams";
class DeleteSensorEvents extends React.Component {
  render() {
    return (
      <DeleteMulti
        label="sensor events"
        source="event_ids"
        reference="sensor_events"
        optionText="name"
        optionValue="id"
        title="Remove events from sensors"
        deleteUrl={`sensor_events`}
        onCancel={() => this.context.router.history.goBack()}
      />
    );
  }
}
DeleteSensorEvents.contextTypes = {
  router: PropTypes.object
};
export default /**
 * @name DeleteSensorEvents
 * @example <DeleteSensorEvents/>
 * A component to delete multiple events from a sensors. Uses DeleteMulti component.
 */
props => (
  <InjectParams
    resolve={resolveIfSensor}
    OnFailResolve={
      <Forwarder to="/company_sensors" message="Sensor not found!" />
    }
  >
    <DeleteSensorEvents {...props} />
  </InjectParams>
);
