/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import { SimpleForm, TextInput, DisabledInput, Edit } from "admin-on-rest";

/**
 * @example <CompaniesEdit/>
 * @description View for the editing the company's detail
 */
function CompaniesEdit(props) {
  return (
    <Edit {...props}>
      <SimpleForm>
        <DisabledInput source="id" />
        <TextInput source="name" />
      </SimpleForm>
    </Edit>
  );
}

export default CompaniesEdit;
