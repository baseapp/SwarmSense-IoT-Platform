/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import { Edit, SimpleForm } from "admin-on-rest";
import { InputSensorType as SensorTypeInput } from "./index";

let SensorTypeEdit = props => {
  return (
    <Edit {...props}>
      <SimpleForm>
        <SensorTypeInput view="edit" />
      </SimpleForm>
    </Edit>
  );
};

export default /**
 * @name SensorTypeEdit
 * @example <SensorTypeEdit/>
 * @description AOR based Edit component to edit sensor-type. Uses custom
 * form field SensorTypeInput.
 */
SensorTypeEdit;
