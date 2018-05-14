/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import { Edit } from "admin-on-rest";
import FormAlert from "./FormAlert";
function AlertsTypeEdit(props) {
  return (
    <Edit {...props} title="Edit Alert">
      <FormAlert view="edit" />
    </Edit>
  );
}
/**
 * @example <AlertsTypeEdit/>
 * @description Edit view for the alerts type
 */
export default AlertsTypeEdit;
