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
// View for the list of sensor-types
import { SimpleList } from "./index";
import EditButton from "./EditButton";
import { set_params } from "../utils";
import PostPagination from "./PostPagination";
const SensorTypesList = props => {
  let make_fields = fields => {
    // generates comma separated string of all the fields(array input)
    // in the sensor-type
    // console.log(fields)
    return Object.getOwnPropertyNames(fields).join(", ");
  };
  return (
    <List {...props} title="Sensor Types List" pagination={<PostPagination />}>
      {permissions => {
        const editItems = permissions === "read" ? false : true;
        return (
          <Responsive
            small={
              <SimpleList
                onEditItem={record => set_params("sensor_type", record)}
                editItems={editItems}
                primaryText={record => `Title - ${record.title}`}
              />
            }
            medium={
              <Datagrid>
                <TextField source="title" />
                <TextField source="type" />

                {editItems && (
                  <EditButton
                    onClick={record => set_params("sensor_type", record)}
                  />
                )}
              </Datagrid>
            }
          />
        );
      }}
    </List>
  );
};
export default /**
 * @name SensorTypesList
 * @example <SensorTypesList/>
 * @description React functional component to list all the sensor-types
 */
SensorTypesList;
