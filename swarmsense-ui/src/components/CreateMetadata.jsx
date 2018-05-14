/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import { Create, TextInput, SimpleForm } from "admin-on-rest";

function MetadataCreate(props) {
  return (
    <Create {...props} title="Update user settings">
      <SimpleForm redirect="list">
        <TextInput source="key" />
        <TextInput source="value" />
      </SimpleForm>
    </Create>
  );
}
export default /**
 * @name MetadataCreate
 * @example <MetadataCreate/>
 * @description View for creating/updating the current user's metadata.
 */
MetadataCreate;
