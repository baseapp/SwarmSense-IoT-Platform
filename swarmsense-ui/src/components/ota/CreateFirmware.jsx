import React from "react";
import {
    Create,
    SimpleForm,
    TextInput,
    ReferenceInput,
    SelectInput,
    SelectArrayInput,
    FileInput,
    FileField
} from "admin-on-rest";

/**
 * @example <CreateFirmware/>
 * @description View to create or add new firmware.
 */
function CreateFirmware(props) {
    return (
        <Create {...props}>
            <SimpleForm redirect="list">
                <TextInput source="name" />
                <TextInput source="version"  />
                <ReferenceInput source="sensor_type" reference="sensor_types">
                    <SelectInput optionText="title" optionValue="type"/>
                </ReferenceInput>
                <ReferenceInput source="test_sensors" reference="company_sensors">
                    <SelectArrayInput optionText="name"/>
                </ReferenceInput>
                <FileInput source="firmware" label="Firmware File" accept="application/pdf" placeholder={<p>Drop your firmware file here</p>}>
                    <FileField source="src" title="title" />
                </FileInput>
            </SimpleForm>
        </Create>
    );
}

export default CreateFirmware;