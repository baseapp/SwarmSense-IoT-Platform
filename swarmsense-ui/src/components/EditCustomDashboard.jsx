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
  DisabledInput,
  Edit,
  ReferenceInput,
  SelectInput
} from "admin-on-rest";
import { DependentInput } from "aor-dependent-input";

/**
 * EditMyDashboard - A stateless react component for making "Edit user dashboard" form.
 *
 * @param  {Object} props
 * @return {React.Node}
 */

function EditMyDashboard(props) {
  return (
    <Edit {...props}>
      <SimpleForm
        defaultValue={{ id: "", data: {}, dashboard_type: "general" }}
      >
        <DisabledInput source="id" />
        <TextInput source="data.name" label="title" />
        <SelectInput
          label="Type"
          source="dashboard_type"
          choices={[
            { id: "general", name: "General" },
            { id: "device-general", name: "Device Type" },
            { id: "network", name: "Network" }
          ]}
        />
        <DependentInput dependsOn="dashboard_type" value="device-general">
          <ReferenceInput
            label="Sensor type"
            source="sensor_type"
            reference="sensor_types"
            allowEmpty
          >
            <SelectInput optionText="title" optionValue="id" />
          </ReferenceInput>
        </DependentInput>
      </SimpleForm>
    </Edit>
  );
}
/*** // network dashboard
<DependentInput dependsOn="data.type" value="network">
  <ReferenceInput
    label="Network"
    source="data.network_id"
    reference="company_networks"
    allowEmpty
  >
    <SelectInput optionText="title" optionValue="type" />
  </ReferenceInput>
</DependentInput>
**/
export default EditMyDashboard;
