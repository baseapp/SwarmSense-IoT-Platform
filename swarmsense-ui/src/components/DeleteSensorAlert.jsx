/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import { DeleteMulti } from "./index";
import { resolveIfSensor } from "../utils";
import Forwarder from "./Forwarder";
import InjectParams from "./InjectParams";
function SensorsAlertsDelete(props) {
  let { global_company: { id: cid }, sensor: { id: sid } } = props;
  return (
    <DeleteMulti
      source="alert_ids"
      reference={`sensors/${sid}/alerts`}
      optionText="name"
      optionValue="id"
      title="Remove alerts from sensor"
      label="alerts"
      deleteUrl={`sensors/${sid}/alerts`}
    />
  );
}
export default /**
 * @name SensorsAlertsDelete
 * @example <SensorsAlertsDelete/>
 * @description Component to delete the alerts from a sensor. Facilitates users
 * to delete many alerts at once.
 */
props => (
  <InjectParams
    resolve={resolveIfSensor}
    OnFailResolve={
      <Forwarder to="/company_sensors" message="Sensor not found!" />
    }
  >
    <SensorsAlertsDelete {...props} />
  </InjectParams>
);
