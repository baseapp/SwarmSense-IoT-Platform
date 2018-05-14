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
  LongTextInput,
  SelectInput
} from "admin-on-rest";

// A common denominator for Create and Edit view
// of the system-wide settings
/**
 * @name SettingsForm
 * @example <SettingsForm/>
 * @description SimpleForm(AOR) to create/edit web-settings
 */
function SettingsForm(props) {
  return (
    <SimpleForm {...props} defaultValue={{ access: "private" }} redirect="list">
      <TextInput source="label" />
      <TextInput source="key" />
      <LongTextInput
        source="value"
        elStyle={{ border: "solid 1px grey", padding: "5px" }}
        options={{ rows: 5, underlineShow: false }}
      />
      <TextInput source="group" />
      <SelectInput
        source="access"
        optionText="label"
        optionValue="value"
        choices={[
          { label: "Private", value: "private" },
          { label: "Public", value: "public" }
        ]}
      />
      <LongTextInput source="description" elStyle={{ width: "260px" }} />
      <TextInput source="order" />
    </SimpleForm>
  );
}

export default SettingsForm;
