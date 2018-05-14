/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import { Field } from "redux-form";
import { TimePicker as MaterialTimePicker } from "redux-form-material-ui";
// A field( ref: admin-on-rest & react-redux)
// to input the time using the MaterialUI's TimePicker

function TimePickerField(props) {
  let { source, hintText, format, parse, normalize } = props;
  return (
    <Field
      name={source}
      format={format}
      normalize={normalize}
      parse={parse}
      hintText={hintText}
      component={MaterialTimePicker}
    />
  );
}

export default /**
 * @name TimePickerField
 * @example <TimePickerField/>
 * @description A material-ui based component for selecting time. Uses redux-form's
 * Field. To be used as a child of SimpleForm(AOR)
 */
TimePickerField;
