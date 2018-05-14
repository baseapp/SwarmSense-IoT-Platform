/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import { Create, SimpleForm } from "admin-on-rest";
import { InputSensorType as SensorTypeInput } from "./index";

function SensorTypeCreate(props) {
  return (
    <Create {...props}>
      <SimpleForm
        defaultValue={{ config_fields: [], fields: [] }}
        redirect="list"
      >
        <SensorTypeInput view="create" />
      </SimpleForm>
    </Create>
  );
}

export default /**
 * @name SensorTypeCreate
 * @example <SensorTypeCreate/>
 * @description AOR based Create component to create sensor-type. Uses custom
 * form field SensorTypeInput.
 */
SensorTypeCreate;
