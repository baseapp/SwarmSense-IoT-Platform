/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import { MapSensors as SensorsMap, Forwarder } from "./index";
import { resolveIfCompany, resolveIfNetwork } from "../utils";
import InjectParams from "./InjectParams";
export default /**
 * @name NetworkSensorsMap
 * @description A react component to show all the sensors of network on map.
 * @example <NetworkSensorsMap/>
 */
props => (
  <InjectParams
    resolve={params => resolveIfCompany(params) && resolveIfNetwork(params)}
    OnFailResolve={
      <Forwarder to="/company_networks" message="No network found!" />
    }
  >
    <SensorsMap {...props} nid={true} />
  </InjectParams>
);
