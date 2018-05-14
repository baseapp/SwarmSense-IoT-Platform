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
        <TextInput source="name" />
        <DisabledInput source="type" />
        <TextInput
          source="key"
          options={{
            onChange: (e, v) => null,
            errorText: "Key can not be changed!"
          }}
        />
        <TextInput source="hid" label="HID" />
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
