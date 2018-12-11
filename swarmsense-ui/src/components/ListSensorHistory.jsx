/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import { List, Datagrid, FunctionField } from "admin-on-rest";
import { Responsive } from "admin-on-rest";
import LinearProgress from "material-ui/LinearProgress";
import { connect } from "react-redux";
import { showNotification } from "admin-on-rest";
import { rest_client as restClient } from "../rest";
import {
  ActionPanel,
  FilterSensorHistory_date as HistoryFilter,
  SimpleList
} from "./index";
import { resolveIfSensor } from "../utils";
import Forwarder from "./Forwarder";
import InjectParams from "./InjectParams";
import PostPagination from "./PostPagination";

export class SensorsHistoryList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true, sensor_types: [] };
    // this.logger = get_logger("ListSensorHistory");
  }
  componentWillMount() {
    restClient("GET_ONE", "sensor_types_all", {})
      .then(json => {
        let _data = [];
        Object.getOwnPropertyNames(json.data).map(name => {
          let sort_me_desc = (a, b) => {
            let weight_a = json.data[name].fields[a].weight || 10;
            let weight_b = json.data[name].fields[b].weight || 10;
            return weight_b - weight_a;
          };
          let _ob = {};
          _ob.type = name;
          _ob.fields = Object.getOwnPropertyNames(json.data[name].fields).sort(
            sort_me_desc
          );
          _data.push(_ob);
          return null;
        });
        this.setState({ ...this.state, sensor_types: _data, loading: false });
      })
      .catch(err => {
        this.props.dispatch(showNotification(err.message, "warning"));
      });
  }

  /**
   * make_fields - Makes field component for the field in the sensor data.
   *
   * @param  {string} stype              sensor-type
   * @param  {boolean} flag = true        controls if the field names are to returned.
   * @param  {boolean} responsive = false
   * @return {React.Node}
   */

  make_fields(stype, flag = true, responsive = false) {
    //console.log(this.state)
    let _fields = this.state.sensor_types.filter(ob => ob.type === stype)[0]
      .fields;
    if (responsive) {
      if (flag) {
        return _fields; //valid field names
      } else {
        return _fields.map(name => `value.${name}`);
      }
    } else {
      return _fields.map((name, i) => {
        let field_name = flag ? name : `value.${name}`;
        return (
          <FunctionField
            source={field_name}
            label={name}
            key={i}
            render={record => {
              let val = record[field_name];

              if (val && val.toString().startsWith("http")) {
                let _parts = val.toString().split("/"),
                  file_id = _parts[_parts.length - 1].split("?")[0];
                return (
                  <a href={val} target="_blank">
                    {file_id}
                  </a>
                );
              } else if (val === 0) {
                return 0;
              } else {
                return val || "na";
              }
            }}
          />
        );
      });
    }
  }
  render() {
    let { sensor: { id: sid, type: stype } } = this.props;
    if (this.state.loading) {
      return <LinearProgress />;
    }
    let actionPanel = (
      <ActionPanel
        customButtons={[
          { href: "#/company_sensors", label: "Sensors" },
          {
            label: "Export",
            href: "#/sensor_export"
          },
          {
            href: `#/sensor_chart`,
            label: "Graphs"
          },
          {
            label: "Alerts",
            href: "#/sensor_alerts"
          },
          {
            label: "Events",
            href: "#/sensor_events"
          }
        ]}
      />
    );
    if (sid && stype) {
      return (
        <List
          {...this.props}
          title="Sensor History"
          actions={actionPanel}
          perPage={20}
          filters={<HistoryFilter />}
          sort={{ field: "time", order: "DESC" }}
          pagination={<PostPagination />}
        >
          <Responsive
            small={
              <SimpleList
                editItems={false}
                primaryText={record => {
                  let fields = this.make_fields(stype, true, true); // get the field names
                  return (
                    <div>
                      {fields
                        .map(n => {
                          // if(record[n].toString().startsWith('http')){
                          //   let _parts = record[n].toString().split('/'),
                          //   file_id = _parts[_parts.length-1].split('?')[0].splice(0,4).concat('...')
                          //   return <a href={val} target="_blank">{file_id}</a>
                          // }
                          // else{
                          //   return record[n]
                          // }
                          return `${n} : ${record[n] || "na"}`;
                        })
                        .join(" / ")}
                    </div>
                  );
                }}
                secondaryText={({ time }) => {
                  if (!time) return "never";
                  let d = new Date(time);
                  return `${d.getFullYear()}-${d.getMonth() +
                    1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
                }}
              />
            }
            medium={
              <Datagrid>
                {this.make_fields(stype)}
                <FunctionField
                  source="time"
                  render={({ time }) => {
                    if (!time) return "never";
                    let d = new Date(time);
                    return `${d.getFullYear()}-${d.getMonth() +
                      1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
                  }}
                />
              </Datagrid>
            }
          />
        </List>
      );
    } else {
      return <div>Sensor not found</div>;
    }
  }
}
SensorsHistoryList = connect()(SensorsHistoryList);
export default /**
 * @name SensorHistoryList
 * @example <SensorsHistoryList/>
 * @description The List(AOR) component to view the history data for a sensor
 */
props => (
  <InjectParams
    resolve={resolveIfSensor}
    OnFailResolve={
      <Forwarder to="/company_sensors" message="No sensor found!" />
    }
  >
    <SensorsHistoryList {...props} />
  </InjectParams>
);
