/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import {
  Edit,
  SimpleForm,
  TextInput,
  ImageInput,
  ImageField
} from "admin-on-rest";
import { ActionPanel } from "./index.js";
function NetworkEdit(props) {
  return (
    <Edit
      {...props}
      title="Edit network"
      actions={
        <ActionPanel
          view="edit"
          customButtons={[
            {
              label: "Alerts",
              href: `#/company_network_alerts`
            }
          ]}
        />
      }
    >
      <SimpleForm {...props}>
        <TextInput source="name" label="Network name" />
        <ImageInput source="floormap" label="New floormap" accept="image/*">
          <ImageField source="url" title="title" />
        </ImageInput>
      </SimpleForm>
    </Edit>
  );
}
export default /**
 * @name NetworkEdit
 * @description View for updating a network of current company
 * @example <NetworkEdit/>
 */
NetworkEdit;
