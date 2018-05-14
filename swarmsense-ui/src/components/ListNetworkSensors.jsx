/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import { SensorsList } from "./ListSensors";
import { resolveIfNetwork } from "../utils";
import Forwarder from "./Forwarder";
import InjectParams from "./InjectParams";
export default /**
 * @name NetworkSensorsList
 * @description a functional react component to list all the sensors in a network.
 * @example <NetworkSensorsList/>
 */
props => (
  <InjectParams
    resolve={resolveIfNetwork}
    OnFailResolve={
      <Forwarder to="/company_networks" message="No network found!!" />
    }
  >
    <SensorsList {...props} nid={true} />
  </InjectParams>
);
