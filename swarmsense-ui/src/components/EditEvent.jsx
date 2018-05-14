/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import { Edit } from "admin-on-rest";
import FormEvent from "./FormEvent";
function EditEvent(props) {
  return (
    <Edit {...props} title="Edit Event">
      <FormEvent />
    </Edit>
  );
}
export default /**
 * @name EditEvent
 * @description View for updating an Event(relevant to scheduling)
 */
EditEvent;
