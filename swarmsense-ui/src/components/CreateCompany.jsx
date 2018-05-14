/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import { Create, SimpleForm, TextInput } from "admin-on-rest";

/**
 * @example <CompaniesCreate/>
 * @description View to create the company
 */

/**
 * CompaniesCreate - A react component to make "create company" form.
 *
 * @param  {Object} props
 * @return {React.Node}
 */

function CompaniesCreate(props) {
  return (
    <Create {...props}>
      <SimpleForm redirect="list">
        <TextInput source="name" />
      </SimpleForm>
    </Create>
  );
}

export default CompaniesCreate;
