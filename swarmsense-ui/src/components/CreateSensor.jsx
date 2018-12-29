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
  Toolbar,
  SaveButton
} from "admin-on-rest";
import HelpIcon from "material-ui/svg-icons/action/help";
import {cyan300} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import { set_params } from "../utils";
import { FieldLatLng as LatLongField } from "./index";

const MyToolbar = props =>
 <Toolbar {...props} >
   <SaveButton label="Create" />
 </Toolbar>;

function SensorsCreate(props) {
  return (
    <Create {...props}>
      <SimpleForm
        defaultValue={{ location_lat: 0, location_long: 0 }}
        redirect="list"
        toolbar={<MyToolbar />}
      >
        <TextInput source="name" style={{ display: 'inline-block' }} />
        <IconButton tooltip="Name of the sensor" style={{ display: 'inline-block', marginLeft: 32 }}  >
        <HelpIcon color={cyan300} />
        </IconButton>
        <IconButton style={{ display: 'block', height: 0 }} />
        <ReferenceInput
          label="Sensor type"
          source="type"
          reference="sensor_types_all"
          style={{ display: 'inline-block' }}
          allowEmpty
        >
          <SelectInput optionText="title" optionValue="type" />
        </ReferenceInput>
        <IconButton tooltip="Sensor Type" style={{ display: 'inline-block', marginLeft: 32, position: 'absolute', marginTop: 10 }} >
        <HelpIcon color={cyan300}/>
        </IconButton>
        <IconButton style={{ display: 'block', height: 0 }} />
        <TextInput source="hid" label="Serial Number(HID)" style={{ display: 'inline-block' }}/>
        <IconButton tooltip="Serial number for sensor" style={{ display: 'inline-block', marginLeft: 32 }} >
        <HelpIcon color={cyan300}/>
        </IconButton>
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
