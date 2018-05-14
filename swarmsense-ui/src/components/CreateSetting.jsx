/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import { Create } from "admin-on-rest";
import { FormSetting as SettingsForm } from "./index";

function SettingsCreate(props) {
  return (
    <Create {...props}>
      <SettingsForm />
    </Create>
  );
}
export default /**
@name SettingsCreate
@description Create view for the system-wide settings.
@example <SettingsCreate/>
*/
SettingsCreate;
