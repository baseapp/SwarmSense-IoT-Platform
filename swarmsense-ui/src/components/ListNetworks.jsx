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
  FunctionField,
  TextField,
  ImageField
} from "admin-on-rest";
import { Responsive } from "admin-on-rest";
import { connect } from "react-redux";
import LinearProgress from "material-ui/LinearProgress";
import FlatButton from "material-ui/FlatButton";
import MenuItem from "material-ui/MenuItem";
import { SimpleList, ActionPanel } from "./index";
import { set_params } from "../utils";
import { resolveIfCompany } from "../utils";
import Forwarder from "./Forwarder";
import InjectParams from "./InjectParams";
import EditButton from "./EditButton";
/**
 * @name NetworksList
 * @description View to list all the networks for the current company
 * @example <NetworksList/>
 */
let NetworksList = props => {
  const linkStyle = {
    textTransform: "capitalize",
    textDecoration: "none",
    color: "rgb(0, 188, 212)",
    fontSize: "0.93rem"
  };
  return (
    <List {...props} title="Networks" actions={<ActionPanel />}>
      {permissions => {
        const editItems = permissions === "read" ? false : true;
        return (
          <Responsive
            small={
              <SimpleList
                onEditItem={record => set_params("network", record)}
                editItems={editItems}
                primaryText={record => {
                  return (
                    <a
                      style={linkStyle}
                      onClick={() => {
                        set_params("network", record);
                      }}
                      href="#/company_network_sensors"
                    >
                      {record.name}
                    </a>
                  );
                }}
                secondaryText={({ sensor_count, sensors_on, sensors_off }) => (
                  <div>
                    <span style={{ color: "green" }}>
                      {" "}
                      {sensors_on} (online){" "}
                    </span>
                    /
                    <span style={{ color: "red" }}>
                      {" "}
                      {sensors_off} (offline){" "}
                    </span>
                    /
                    <span title="total-sensors"> {sensor_count} (total) </span>
                  </div>
                )}
                menuItems={record => [
                  <MenuItem
                    primaryText="Sensors"
                    onClick={() => {
                      set_params("network", record);
                    }}
                    href="#/company_network_sensors"
                  />
                ]}
              />
            }
            medium={
              <Datagrid>
                <FunctionField
                  render={record => (
                    <a
                      style={linkStyle}
                      onClick={() => {
                        set_params("network", record);
                      }}
                      href="#/company_network_sensors"
                    >
                      {record.name}
                    </a>
                  )}
                  source="name"
                />
                <TextField source="sensors_on" label="live-sensors" />
                <TextField source="sensors_off" label="offline-sensors" />
                <TextField source="sensor_count" label="total-sensors" />
                <FunctionField
                  render={({ id, floormap }) => {
                    let { global_company: { id: cid, key } } = props;
                    if (floormap) {
                      return (
                        <a href={`#/floormap/${id}?cid=${cid}`}>
                          <img
                            height="100"
                            width="100"
                            src={`${
                              window.API_URL
                            }/companies/${cid}/networks/${id}/floormap?company_key=${key}`}
                            alt={floormap}
                          />
                        </a>
                      );
                    } else {
                      return <span>None</span>;
                    }
                  }}
                  label="Floormap"
                  sortable={false}
                />
                {editItems && (
                  <EditButton
                    onClick={record => {
                      set_params("network", record);
                    }}
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
export default props => (
  <InjectParams
    resolve={resolveIfCompany}
    OnFailResolve={
      <Forwarder to="/company_networks" message="No network found!!" />
    }
  >
    <NetworksList {...props} />
  </InjectParams>
);
