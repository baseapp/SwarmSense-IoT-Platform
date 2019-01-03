/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import { DateInput, Filter } from "admin-on-rest";
import React from "react";
/**
 * @name HistoryFilter
 * @example <HistoryFilter/>
 * @description React functional component to create AOR's Filter component
 * for the HistoryExport List component
 */
function HistoryFilter(props) {
  return (
    <Filter {...props}>
      <DateInput label="To" source="end_date" alwaysOn />
      <DateInput label="From" source="start_date" alwaysOn />
    </Filter>
  );
}
export default HistoryFilter;
