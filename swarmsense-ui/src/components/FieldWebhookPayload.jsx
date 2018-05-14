/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import { TextInput } from "admin-on-rest";
import { EmbeddedArrayInput as EmbeddedManyInput } from "aor-embedded-array";

function WebhookPayload(props) {
  return (
    <EmbeddedManyInput source="web_hooks[0].payload" label="Payload">
      <TextInput source="key" label="Key" />
      <TextInput source="value" label="Value" />
    </EmbeddedManyInput>
  );
}
export default /**
 * @name WebhookPayload
 * @example <WebhookPayload/>
 * @description A custom input component to record web-hooks in alert-type create/edit forms
 */
WebhookPayload;
