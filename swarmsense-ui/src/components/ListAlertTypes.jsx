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
  FunctionField,
  Responsive
} from "admin-on-rest";
import { connect } from "react-redux";
import LinearProgress from "material-ui/LinearProgress";
import MenuItem from "material-ui/MenuItem";
import { SimpleList, ActionPanel } from "./index";
import { set_params } from "../utils";
import { resolveIfCompany } from "../utils";
import Forwarder from "./Forwarder";
import InjectParams from "./InjectParams";
import EditButton from "./EditButton";

export class AlertsTypeList extends React.Component {
  // For listing the alert types
  parse_time(hh_mm_ss) {
    // input: time(UTC) string in the form of HH:MM:SS
    // returns the local time in format hh:mm:ss
    let hms = hh_mm_ss.split(":");
    let d = new Date();
    hms[0] && d.setUTCHours(hms[0]);
    hms[1] && d.setUTCMinutes(hms[1]);
    return `${d.getHours()}:${d.getMinutes()}:00`;
  }
  render() {
    let title;
    let customButtons = [{ label: "Sensors", href: "#/company_sensors" }];
    let {
      sensor: { id: _sid },
      network: { id: _nid },
      global_company: { id: cid }
    } = this.props;
    if (this.props.sid && _sid) {
      if (this.props.sensor_history) {
        // set_params('alert_history')
      } else {
        customButtons.push({
          label: "Events",
          href: "#/sensor_events"
        });
        title = "Alert(sensor-wide)";
      }
    } else if (this.props.nid && _nid) {
      // network alerts
      // params can be set here, if necessary
      title = "Alerts(network-wide)";
    } else {
      customButtons.push({
        label: "Events",
        href: "#/events"
      });
      title = "Alerts";
    }
    const linkStyle = {
      textTransform: "capitalize",
      textDecoration: "none",
      color: "rgb(0, 188, 212)",
      fontSize: "0.93rem"
    };
    return (
      <List
        {...this.props}
        title={title}
        perPage={20}
        actions={<ActionPanel customButtons={customButtons} />}
      >
        {permissions => {
          let editItems = permissions === "read" ? false : true;
          return (
            <Responsive
              small={
                <SimpleList
                  onEditItem={record => set_params("alert", record)}
                  primaryText={({ name }) => {
                    return (
                      <a
                        style={linkStyle}
                        onClick={() => {
                          set_params("alert", {name});
                        }}
                        href="#/alert_history"
                      >
                        {name}
                      </a>
                    );
                  }}
                  editItems={editItems}
                  secondaryText={({ alert_text }) => alert_text}
                  menuItems={record => [
                    <MenuItem
                      primaryText="Alert history"
                      onClick={() => set_params("alert", record)}
                      href="#/alert_history"
                    />
                  ]}
                />
              }
              medium={
                <Datagrid>
                  <FunctionField
                    source="name"
                    render={record => {
                      return (
                        <a
                          style={linkStyle}
                          onClick={() => {
                            set_params("alert", record);
                          }}
                          href="#/alert_history"
                        >
                          {record.name}
                        </a>
                      );
                    }}
                  />
                  <TextField source="action_type" />
                  <TextField source="alert_text" />
                  <TextField source="snooze" />
                  <TextField source="type" />
                  <TextField source="value" />

                  {editItems && (
                    <EditButton
                      onClick={record => set_params("alert", record)}
                    />
                  )}
                </Datagrid>
              }
            />
          );
        }}
      </List>
    );
  }
}

/**
 * @name AlertsTypeList
 * @example <AlertsTypeList/>
 * @description A react component to list alert-types.
 */
export default props => (
  <InjectParams
    resolve={resolveIfCompany}
    OnFailResolve={<Forwarder to="/" message="No company found!!" />}
  >
    <AlertsTypeList {...props} />
  </InjectParams>
);
