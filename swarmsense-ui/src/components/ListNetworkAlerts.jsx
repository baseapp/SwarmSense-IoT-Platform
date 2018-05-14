/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import { AlertsTypeList } from "./ListAlertTypes";
import { resolveIfNetwork } from "../utils";
import Forwarder from "./Forwarder";
import InjectParams from "./InjectParams";
export default /**
 * @name NetworkAlertsList
 * @description A react component to list all the alerts of a network
 * @example <NetworkAlertsList/>
 */
props => (
  <InjectParams
    resolve={resolveIfNetwork}
    OnFailResolve={
      <Forwarder to="/company_networks" message="No network found!!" />
    }
  >
    <AlertsTypeList {...props} nid={true} />
  </InjectParams>
);
