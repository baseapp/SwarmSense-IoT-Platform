/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import { Filter, TextInput } from "admin-on-rest";
/**
 * @name SensorFilter
 * @description AOR based Filter for SensorsMap to search for the sensors
 * @example <SensorFilter/>
 */

function SensorFilter(props) {
  return (
    <Filter {...props}>
      <TextInput source="q" label="Sensor-name" alwaysOn />
    </Filter>
  );
}

export default SensorFilter;
