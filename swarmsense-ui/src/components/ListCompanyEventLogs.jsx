/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import {
  List,
  Datagrid,
  TextField,
  Responsive,
  FunctionField
} from "admin-on-rest";
import { moments_ago } from "../utils";
import { SimpleList } from "./index";
import PostPagination from "./PostPagination";

/**
 * Stateless component for creating grid - list of eventlogs.
 * @function
 * @param {Object} props
 * @return {React.Node}
 */

let EventsLog = props => {
  return (
    <List {...props} title="Events log" pagination={<PostPagination />}>
      <Responsive
        small={
          <SimpleList
            primaryText={({ log }) => log}
            secondaryText={({ time }) => moments_ago(Date.parse(time))}
            editItems={false}
          />
        }
        medium={
          <Datagrid>
            <TextField source="log" />
            <FunctionField
              render={({ time }) => moments_ago(Date.parse(time))}
              source="time"
            />
          </Datagrid>
        }
      />
    </List>
  );
};

export default EventsLog;
