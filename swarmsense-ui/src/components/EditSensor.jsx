/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import { SimpleForm, TextInput, DisabledInput, Edit } from "admin-on-rest";
import { ActionPanel, FieldLatLng as LatLongField } from "./index";
import HelpIcon from "material-ui/svg-icons/action/help";
import {cyan300} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import { resolveIfSensor } from "../utils";
import Forwarder from "./Forwarder";
import InjectParams from "./InjectParams";
function SensorsEdit(props) {
  return (
    <Edit
      {...props}
      actions={
        <ActionPanel
          view="edit"
          customButtons={[
            {
              label: "configure",
              href: "#/sensor_configuration"
            },
            {
              label: "Graph",
              href: "#/sensor_chart"
            },
            {
              label: "Alerts",
              href: "#/sensor_alerts"
            },
            {
              label: "Events",
              href: "#/sensor_events"
            }
          ]}
        />
      }
    >
      <SimpleForm>
        <TextInput source="name" style={{ display: 'inline-block' }} />
        <IconButton tooltip="Name of the sensor" style={{ display: 'inline-block', marginLeft: 32 }}  >
        <HelpIcon color={cyan300} />
        </IconButton>
        <IconButton style={{ display: 'block', height: 0 }} />
        <DisabledInput source="type" style={{ display: 'inline-block' }} />
        <IconButton tooltip="Sensor Type" style={{ display: 'inline-block', marginLeft: 32 }}  >
        <HelpIcon color={cyan300} />
        </IconButton>
        <IconButton style={{ display: 'block', height: 0 }} />
        <TextInput
          source="key"
          options={{
            onChange: (e, v) => null,
            errorText: "Key can not be changed!"
          }}
          style={{ display: 'inline-block' }}
        />
        <IconButton tooltip="Key of the sensor" style={{ display: 'inline-block', marginLeft: 32, position: 'absolute', marginTop: 10 }}  >
        <HelpIcon color={cyan300} />
        </IconButton>
        <IconButton style={{ display: 'block', height: 0 }} />
        <TextInput source="hid" label="HID" style={{ display: 'inline-block' }} />
        <IconButton tooltip="Serial number for sensor" style={{ display: 'inline-block', marginLeft: 32 }}  >
        <HelpIcon color={cyan300} />
        </IconButton>
        <IconButton style={{ display: 'block', height: 0 }} />
        <LatLongField />
      </SimpleForm>
    </Edit>
  );
}

export default /**
 * @name SensorsEdit
 * @example <SensorsEdit/>
 * @description Creates the AOR's Edit view for editing sensors
 */
props => (
  <InjectParams
    resolve={resolveIfSensor}
    OnFailResolve={<Forwarder to="/" message="Select sensor first!!" />}
  >
    <SensorsEdit {...props} />
  </InjectParams>
);
