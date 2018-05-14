/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import { AlertsTypeList } from "./ListAlertTypes";
import { resolveIfSensor } from "../utils";
import Forwarder from "./Forwarder";
import InjectParams from "./InjectParams";

let SensorsAlertsTypeList = props => (
  <InjectParams
    resolve={resolveIfSensor}
    OnFailResolve={
      <Forwarder to="/company_sensors" message="No sensor found!" />
    }
  >
    <AlertsTypeList {...props} sid={true} />
  </InjectParams>
);
export default /**
 * @name SensorsAlertsTypeList
 * @example <SensorsAlertsTypeList/>
 * @description List(AOR) of alerts of a sensor.
 */
SensorsAlertsTypeList;
