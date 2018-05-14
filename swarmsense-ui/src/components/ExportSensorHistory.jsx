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
  Responsive,
  SimpleList
} from "admin-on-rest";
import FlatButton from "material-ui/FlatButton";
import { apiUrl } from "../rest";
import {
  ActionPanel,
  FilterSensorHistory_date as HistoryFilter
} from "./index";
import { resolveIfSensor } from "../utils";
import Forwarder from "./Forwarder";
import InjectParams from "./InjectParams";
let NoOps = props => null;

class HistoryExport extends React.Component {
  render_list = record => {
    let { sensor: { id: sid, key } } = this.props;
    let href = `${apiUrl}/sensors/${sid}/export`;
    href += `?sensor_key=${key}`; //add sensor_key
    let filter = record["content"]["params"]["filter"];
    href += `&filter=${JSON.stringify(filter)}`;
    return (
      <FlatButton href={href} label="Click to download" target={"_blank"} />
    );
  };
  render() {
    let { sensor: { name } } = this.props;
    return (
      <List
        {...this.props}
        perPage={10000}
        pagination={<NoOps />}
        filters={<HistoryFilter />}
        actions={
          <ActionPanel
            customButtons={[
              { href: "#/company_sensors", label: "Sensors" },
              {
                href: `#/sensor_history`,
                label: "History"
              }
            ]}
          />
        }
        title={`Export data(${name})`}
      >
        <Responsive
          small={
            <SimpleList primaryText={record => this.render_list(record)} />
          }
          medium={
            <Datagrid>
              <FunctionField
                render={record => this.render_list(record)}
                sortable={false}
              />
            </Datagrid>
          }
        />
      </List>
    );
  }
}
export default /**
 * @name HistoryExport
 * @example <HistoryExport/>
 * @description A List(AOR) component to export the history data. Facilitates users
 * to select data history based on the date.
 */
props => (
  <InjectParams
    resolve={resolveIfSensor}
    OnFailResolve={<Forwarder to="/" message="Select sensor first!!" />}
  >
    <HistoryExport {...props} />
  </InjectParams>
);
