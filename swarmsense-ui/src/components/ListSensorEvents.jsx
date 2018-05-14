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
  Datagrid,
  TextInput,
  Responsive
} from "admin-on-rest";
import PropTypes from "prop-types";
import { set_params } from "../utils";
import { SimpleList, ActionPanel } from "./index";
import { resolveIfSensor } from "../utils";
import Forwarder from "./Forwarder";
import InjectParams from "./InjectParams";

/**
 * @extends React.Component
 * Lists all the events of a sensor
 */

class ListSensorEvents extends React.Component {
  render() {
    let props = this.props;
    let title = "Sensor Events",
      company_role = sessionStorage.getItem("company_role") || "read",
      readOnly = company_role === "read" ? true : false,
      customButtons = readOnly
        ? []
        : [
            {
              label: "Remove",
              secondary: true,
              onClick: () => {
                this.context.router.history.push("/sensor_events/edit");
              }
            }
          ];
    return (
      <List
        {...props}
        title={title}
        actions={<ActionPanel customButtons={customButtons} />}
      >
        <Responsive
          small={
            <SimpleList
              editItems={false}
              primaryText={({ name }) => {
                return `${name}`;
              }}
            />
          }
          medium={
            <Datagrid>
              <TextField source="name" label="Name" />
            </Datagrid>
          }
        />
      </List>
    );
  }
}
ListSensorEvents.contextTypes = {
  router: PropTypes.object
};
export default props => (
  <InjectParams
    resolve={resolveIfSensor}
    OnFailResolve={
      <Forwarder to="/company_sensors" message="No sensor found!" />
    }
  >
    <ListSensorEvents {...props} />
  </InjectParams>
);
