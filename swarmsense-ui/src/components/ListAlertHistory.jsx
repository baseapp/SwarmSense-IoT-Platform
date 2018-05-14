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
  TextField,
  FunctionField,
  Datagrid,
  TextInput,
  Filter,
  Responsive
} from "admin-on-rest";
import { moments_ago, make_query } from "../utils";
import { SimpleList } from "./index";
import { resolveIfCompany, resolveIfAlert } from "../utils";
import Forwarder from "./Forwarder";
import InjectParams from "./InjectParams";
function AlertHistory(props) {
  let SensorFilter = props => (
    <Filter {...props}>
      <TextInput source="sensor_id" label="Sensor-id" />
    </Filter>
  );
  let title = "Alert history";
  let filter = {};
  let {
    alert: { id: aid } = { id: undefined },
    sensor: { id: sid } = { id: undefined }
  } = props;
  if (aid) {
    filter.alert_id = aid;
  }
  if (sid) {
    filter.sensor_id = sid;
  }
  const linkStyle = {
    textTransform: "capitalize",
    textDecoration: "none",
    color: "rgb(0, 188, 212)",
    fontSize: "0.93rem"
  };
  return (
    <List {...props} title={title} filters={<SensorFilter />} filter={filter}>
      <Responsive
        small={
          <SimpleList
            editItems={false}
            primaryText={({ sensor_name, alert_text }) => {
              return `${alert_text} by ${sensor_name}`;
            }}
            secondaryText={({ time }) => {
              let _d = new Date(time);
              return moments_ago(_d);
            }}
          />
        }
        medium={
          <Datagrid>
            <FunctionField
              label="Sensor-name"
              render={({ sensor_name, sensor_id }) => {
                let filter = { q: sensor_name };
                return (
                  <a
                    style={linkStyle}
                    href={`#/company_sensors?${make_query({ filter })}`}
                  >
                    {sensor_name}
                  </a>
                );
              }}
            />
            <TextField source="alert_text" />
            <FunctionField
              source="time"
              render={({ time }) => {
                let _d = new Date(time);
                return moments_ago(_d);
              }}
            />
          </Datagrid>
        }
      />
    </List>
  );
}
export default /**
 * @name AlertHistory
 * @description A react stateless function component, which lists
 * alert-history of a sensor(if props.sid is set) or an alert(if props.aid is set)
 * @example <AlertHistory>
 */
props => (
  <InjectParams
    resolve={props => resolveIfCompany(props)}
    OnFailResolve={<Forwarder to="#" message="No company found!!" />}
  >
    <AlertHistory {...props} />
  </InjectParams>
);
