/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import { List, Datagrid, TextField, FunctionField } from "admin-on-rest";
import { Responsive, SimpleList } from "admin-on-rest";
import { connect } from "react-redux";
import LinearProgress from "material-ui/LinearProgress";
import FlatButton from "material-ui/FlatButton";
import MenuItem from "material-ui/MenuItem";
import ActionLightbulbOutline from "material-ui/svg-icons/action/lightbulb-outline";
import { red500, green500 } from "material-ui/styles/colors";
import { ActionPanel } from "./index";
import { moments_ago, set_params } from "../utils";
import { rest_client as restClient } from "../rest";
import { resolveIfSensorType } from "../utils";
import Forwarder from "./Forwarder";
import InjectParams from "./InjectParams";
import PostPagination from "./PostPagination";

export class SensorsByTypeList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { types: [] };
  }
  make_columns(of_types) {
    // makes columns for different type of sensors
    return of_types.map((ob, k) => (
      <TextField source={`value.${ob}`} label={ob} key={k} />
    ));
  }
  componentWillMount() {
    restClient("GET_LIST", "sensor_types_all", {
      pagination: { page: 1, perPage: 500 },
      sort: { order: "DESC", field: "type" }
    })
      .then(json => {
        const { sensor_type: { type: stype } } = this.props;
        let types = json.data.filter(ob => ob.type === stype);
        types = Object.keys(types[0].fields);
        this.setState({ types: types });
      })
      .catch(err => console.log(err));
  }
  render() {
    const linkStyle = {
      textTransform: "capitalize",
      textDecoration: "none",
      color: "rgb(0, 188, 212)",
      fontSize: "0.93rem"
    };
    let values = this.make_columns(this.state.types);
    if (values.length === 0) {
      return <LinearProgress />;
    }
    const {
      global_company: { id: cid },
      sensor_type: { type: stype }
    } = this.props;
    let title = `Device List( type - ${stype})`;
    let view = null;
    if (this.props.viewElement) {
      view = <this.props.viewElement cid={cid} />;
    } else {
      view = (
        <Responsive
          small={
            <SimpleList
              primaryText={record => `Sensor-name : ${record.name}`}
              secondaryText={record => `Type : ${record.type}`}
              tertiaryText={record => JSON.stringify(record.value)}
              editItems={false}
              menuItems={record => [
                <MenuItem
                  primaryText="History"
                  onClick={() => {
                    this.props.setParam("sensor", record);
                  }}
                  href="#/sensor_chart"
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
                        this.props.setParam("sensor", record);
                      }}
                      href="#/sensor_chart"
                    >
                      {record.name}
                    </a>
                  );
                }}
              />
              {values}
              <FunctionField
                headerStyle={{ textAlign: "center" }}
                source="is_down"
                label="Online"
                render={props => {
                  let is_down = props.is_down ? red500 : green500;
                  return (
                    <div style={{ textAlign: "center", minWidth: "100%" }}>
                      <ActionLightbulbOutline color={is_down} />
                    </div>
                  );
                }}
              />
              <FunctionField
                source="last_update"
                render={({ last_update }) => {
                  if (!last_update) return "never";
                  let d = new Date(last_update);
                  return moments_ago(d);
                }}
              />
            </Datagrid>
          }
        />
      );
    }
    let perPage = this.props.viewElement ? 1000 : 20;
    let customButtons = []; //common buttons
    if (!this.props.viewElement) {
      // buttons for view without map
      customButtons.push({
        label: "Map",
        href: "#/sensors_type_map"
      });
      customButtons.push({
        label: "Devices(all)",
        href: "#/company_sensors"
      });
    } else {
      customButtons.push({
        label: "Devices(By-type)",
        href: "#/company_sensors_by_type"
      });
    }
    return (
      <div>
        <List
          {...this.props}
          perPage={perPage}
          title={title}
          actions={<ActionPanel customButtons={customButtons} />}
          sort={{ order: "DESC", field: "last_update" }}
          pagination={<PostPagination />}
        >
          {view}
        </List>
      </div>
    );
  }
}
export default /**
 * @name SensorsByTypList
 * @example <SensorsByTypList/>
 * @description AOR based List component to list all the sensors by-type
 */
props => (
  <InjectParams
    resolve={resolveIfSensorType}
    OnFailResolve={<Forwarder to="/" message="No sensor type selected!" />}
  >
    <SensorsByTypeList {...props} />
  </InjectParams>
);
