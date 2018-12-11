/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import {
  Create,
  SimpleForm,
  TextInput,
  SelectInput,
  ReferenceInput,
  SaveButton
} from "admin-on-rest";
import { set_params } from "../utils";
import { FieldLatLng as LatLongField } from "./index";

function SensorsCreate(props) {
  return (
    <Create {...props}>
      <SimpleForm
        defaultValue={{ location_lat: 0, location_long: 0 }}
        redirect="list"
        toolbar={<SaveButton label="Create" />}
      >
        <TextInput source="name" />
        <ReferenceInput
          label="Sensor type"
          source="type"
          reference="sensor_types_all"
          allowEmpty
        >
          <SelectInput optionText="title" optionValue="type" />
        </ReferenceInput>
        <TextInput source="hid" label="Serial Number(HID)" />
        <LatLongField />
      </SimpleForm>
    </Create>
  );
}
export default /**
 * @name SensorsCreate
 * @example <SensorsCreate/>
 * @description Creates the AOR based Create view for creating sensor
 */
SensorsCreate;
