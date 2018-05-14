/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import { Create, SimpleForm, TextInput } from "admin-on-rest";
// for the create view of user creation

function UserCreate(props) {
  return (
    <Create {...props}>
      <SimpleForm redirect="list">
        <TextInput source="name" />
        <TextInput source="email" type="email" />
        <TextInput source="phone" />
        <TextInput source="password" type="password" />
      </SimpleForm>
    </Create>
  );
}
export default /**
@name UserCreate
@description react state-less functional component to render form for
making a user.
@example <UserCreate/>
*/
UserCreate;
