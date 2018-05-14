/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import { Create } from "admin-on-rest";
import FormAlert from "./FormAlert";

/**
 * CreateAlertType - A stateless react component to make "create alert" form.
 *
 * @param  {Object} props
 * @return {React.Node}
 */

function CreateAlertType(props) {
  return (
    <Create {...props} title="Create alert">
      <FormAlert />
    </Create>
  );
}
export default CreateAlertType;
