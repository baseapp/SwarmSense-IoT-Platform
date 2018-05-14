/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import { SimpleForm, TextInput, DisabledInput, Edit } from "admin-on-rest";
function UserEdit(props) {
  return (
    <Edit {...props}>
      <SimpleForm>
        <DisabledInput source="id" />
        <TextInput source="name" />
        <DisabledInput source="email" />
        <TextInput source="phone" />
        <TextInput source="password" type="password" />
      </SimpleForm>
    </Edit>
  );
}
export default /**
 * @name UserEdit
 * @description stateless react component for editing user info
 * @example <UserEdit/>
 */
UserEdit;
