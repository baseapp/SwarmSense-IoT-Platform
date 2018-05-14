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
  BooleanInput,
  DateInput,
  ReferenceInput,
  SelectInput
} from "admin-on-rest";
import { DependentInput } from "aor-dependent-input";
import FieldDateTimePicker from "./FieldDateTimePicker";
import FieldConfigSelector from "./FieldConfigSelector";

/**
 * FormEvent - functional react component for making the form for creating and editing event.
 *
 * @param  {Object} props props object
 * @return {React.Node} React node based on SimpleForm(admin-on-rest) component.
 */

function FormEvent(props) {
  return (
    <SimpleForm {...props} defaulValue={{ repeat: false }} redirect="list">
      <TextInput source="name" label="Event name" />
      <BooleanInput source="repeat" label="Repeat?" />
      <DependentInput dependsOn="repeat" value={true}>
        <SelectInput
          choices={[
            { label: "Every day", value: "day" },
            { label: "Every week", value: "week" },
            { label: "Every month", value: "month" },
            { label: "Every year", value: "year" }
          ]}
          optionText="label"
          optionValue="value"
          source="unit"
        />
      </DependentInput>
      <BooleanInput source="is_active" label="Is Active?" />
      <FieldConfigSelector />
      <FieldDateTimePicker source="start_date" label="Start from" />
    </SimpleForm>
  );
}

export default FormEvent;
