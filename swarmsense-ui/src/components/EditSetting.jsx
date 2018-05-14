/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import { Edit } from "admin-on-rest";
import { FormSetting as SettingsForm } from "./index";

// View for the editing System-wide settings

function SettingsEdit(props) {
  return (
    <Edit {...props}>
      <SettingsForm />
    </Edit>
  );
}

export default /**
 * @name SettingsEdit
 * @description functional react component for editing settings
 * @example <SettingsEdit/>
 */
SettingsEdit;
