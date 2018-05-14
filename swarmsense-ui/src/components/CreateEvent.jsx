/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import { Create } from "admin-on-rest";
import FormEvent from "./FormEvent";

/**
 * CreateEvent - A stateless function to make "create event" form.
 *
 * @param  {Object} props
 * @return {React.Node}
 */

function CreateEvent(props) {
  return (
    <Create {...props} title="Create Event">
      <FormEvent />
    </Create>
  );
}
export default CreateEvent;
