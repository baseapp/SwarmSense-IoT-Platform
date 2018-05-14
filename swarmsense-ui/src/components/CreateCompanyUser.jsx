/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import {
  SimpleForm,
  TextInput,
  Create,
  SelectInput,
  ReferenceInput
} from "admin-on-rest";
import InjectParams from "./InjectParams";
import { resolveIfCompany } from "../utils";
function CompaniesUserCreate(props) {
  let input = <TextInput label="User Email" source="email" />,
    isAdmin = sessionStorage["company_role"] === "super_admin" ? true : false;

  if (isAdmin) {
    input = (
      <ReferenceInput
        label="User Email"
        source="email"
        perPage={1000}
        reference="users"
        allowEmpty
      >
        <SelectInput
          optionValue="email"
          optionText="email"
          options={{ maxSearchResults: 10 }}
        />
      </ReferenceInput>
    );
  }
  return (
    <Create {...props} title="Assign users to company">
      <SimpleForm defaultValue={{ role: "read" }} redirect="list">
        {input}
        <SelectInput
          source="role"
          optionText="label"
          optionValue="value"
          choices={[
            { label: "Read", value: "read" },
            { label: "Write", value: "write" },
            { label: "Admin", value: "admin" }
          ]}
        />
      </SimpleForm>
    </Create>
  );
}

export default /**
 * @name CompaniesUserCreate
 * @example <CompaniesUserCreate/>
 * @description A create(AOR) component to create a user
 */
CompaniesUserCreate;
