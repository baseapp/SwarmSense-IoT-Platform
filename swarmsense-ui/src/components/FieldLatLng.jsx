/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import { Fields } from "redux-form";
import { InputLatLng as LatLongInput } from "./index";

function LatLongField(props) {
  return (
    <Fields
      names={["location_lat", "location_long"]}
      component={LatLongInput}
      {...props}
    />
  );
}

export default /**
@name LatLongField
@example <LatLongField/>
@description A LatLongInput based Field to be used in the AOR's Create/Edit
component.
*/
LatLongField;
