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
  ImageInput,
  ImageField
} from "admin-on-rest";

function NetworkCreate(props) {
  return (
    <Create {...props} title="Create network">
      <SimpleForm redirect="list">
        <TextInput source="name" label="Network name" />
        <ImageInput source="floormap" label="Floormap" accept="image/*">
          <ImageField source="src" title="title" />
        </ImageInput>
      </SimpleForm>
    </Create>
  );
}

export default /**
 * @name NetworkCreate
 * @description View to create network
 * @example <NetworkCreate/>
 */
NetworkCreate;
