/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import { Field } from "redux-form";
import DateTimePicker from "material-ui-datetimepicker";
import DatePickerDialog from "material-ui/DatePicker/DatePickerDialog";
import TimePickerDialog from "material-ui/TimePicker/TimePickerDialog";

function FieldDateTimePicker(props) {
  let { source, hintText, format, parse, normalize, label } = props;
  return (
    <Field
      name={source}
      format={format}
      normalize={normalize}
      parse={parse}
      hintText={hintText}
      component={({ input }) => (
        <DateTimePicker
          onChange={date_time => input.onChange(date_time)}
          DatePicker={DatePickerDialog}
          TimePicker={TimePickerDialog}
          value={input.value}
          floatingLabelText={label}
        />
      )}
    />
  );
}

export default /**
 * @name FieldDateTimePicker
 * @example <FieldDateTimePicker/>
 * @description A material-ui based component for selecting time. Uses redux-form's
 * Field. To be used as a child of SimpleForm(AOR)
 */
FieldDateTimePicker;
