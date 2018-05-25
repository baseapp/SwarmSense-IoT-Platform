import React from 'react';
import {
    Edit,
    SimpleForm,
    DisabledInput,
    TextInput,
    required,
    SelectArrayInput,
    ReferenceInput,
    BooleanInput
} from "admin-on-rest";

let EditFirmware= (props) => (
    <Edit title="Post Edit" {...props}>
        <SimpleForm>
            <DisabledInput label="Id" source="id" />
            <DisabledInput source="version" />
            <DisabledInput source="sensor_type" />
            <TextInput source="name" validate={required} />
            <BooleanInput source="is_deployed" />
            <ReferenceInput source="test_sensors" reference="company_sensors">
                <SelectArrayInput optionText="name" />
            </ReferenceInput>
        </SimpleForm>
    </Edit>
);

export default EditFirmware;