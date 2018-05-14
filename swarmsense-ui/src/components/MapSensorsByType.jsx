/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import {
  IteratorMap as MapIterator,
  ListSensorsByType as SensorsByTypeList,
  Forwarder
} from "./index";
import { resolveIfSensorType } from "../utils";
import InjectParams from "./InjectParams";

export default /**
 * @name SensorsByTypeMap
 * @description creates AOR based List view to show all the sensors by type
 * on map.
 * @example <SensorsByTypeMap/>
 */ props => (
  <InjectParams
    resolve={resolveIfSensorType}
    OnFailResolve={
      <Forwarder to="/company_sensors" message="No sensor type found!" />
    }
  >
    <SensorsByTypeList {...props} viewElement={MapIterator} />
  </InjectParams>
);
