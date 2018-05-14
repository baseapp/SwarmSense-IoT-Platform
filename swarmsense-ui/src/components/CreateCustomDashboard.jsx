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
  Select,
  ReferenceInput,
  SelectInput
} from "admin-on-rest";
import { connect } from "react-redux";
import { DependentInput } from "aor-dependent-input";
import LinearProgress from "material-ui/LinearProgress";

/**
 * CreateMyDashboard - A react stateless component to make "create user dashboard" form.
 *
 * @param  {Object} props
 * @return {React.Node}
 */

function CreateMyDashboard(props) {
  return (
    <Create
      {...props}
      defaultValue={{
        name: ""
      }}
    >
      <SimpleForm redirect="list" defaultValue={{ dashboard_type: "general" }}>
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
    </Create>
  );
}
/***
<DependentInput dependsOn="data.type" value="network">
  <ReferenceInput
    label="Network"
    source="data.network_id"
    reference="company_networks"
    allowEmpty
  >
    <SelectInput optionText="title" />
  </ReferenceInput>
</DependentInput>
**/
export default CreateMyDashboard;
