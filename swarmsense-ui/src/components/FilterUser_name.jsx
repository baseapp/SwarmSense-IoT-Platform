/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import { Filter, TextInput } from "admin-on-rest";
/**
 * @name UserFilter
 * @description AOR based Filter for searching users using name
 * @example <UserFilter/>
 */

function UserFilter(props) {
  return (
    <Filter {...props}>
      <TextInput source="q" label="Search Name" alwaysOn />
    </Filter>
  );
}
export default UserFilter;
