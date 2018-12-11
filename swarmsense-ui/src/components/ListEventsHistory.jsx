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
  Responsive,
  EditButton
} from "admin-on-rest";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { moments_ago, set_params } from "../utils";
import { SimpleList, ActionPanel } from "./index";
import PostPagination from "./PostPagination";
/**
 * Make the list of event's history.
 * @extends React.Component
 */

class ListEventsHistory extends React.Component {
  render() {
    let props = this.props;
    let title = "Events History";
    return (
      <List
        {...props}
        title={title}
        actions={
          <ActionPanel
            customButtons={[
              {
                label: "Events",
                onClick: () => {
                  this.context.router.history.push("events");
                }
              }
            ]}
          />
        }
        pagination={<PostPagination />}
      >
        <Responsive
          small={
            <SimpleList
              editItems={false}
              primaryText={({ event_name, sensor_name, time }) => {
                return `${event_name} by ${sensor_name} @ ${moments_ago(time)}`;
              }}
            />
          }
          medium={
            <Datagrid>
              <TextField source="event_name" label="Event name" />
              <TextField source="sensor_name" label="Sensor name" />
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
}
ListEventsHistory.contextTypes = {
  router: PropTypes.object
};
export default ListEventsHistory;
