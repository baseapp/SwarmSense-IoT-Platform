/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import { Field } from "redux-form";
import LinearProgress from "material-ui/LinearProgress";
import { SelectField } from "redux-form-material-ui";
import MenuItem from "material-ui/MenuItem";
import { rest_client as restClient } from "../rest";

class SensorTypeField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sensor_info: {},
      isLoading: true,
      selected_field: undefined
    };
    if (this.props.record && this.props.record.hasOwnProperty("sensor_type")) {
      this.state.selected_field = this.props.record.sensor_type;
    }
  }
  componentDidMount() {
    restClient("GET_ONE", "sensor_types_all", {})
      .then(json => {
        let sensor_type = [
          { title: null, type: "" },
          { title: "All", type: "all" }
        ];
        let sensor_type_field = [];
        Object.getOwnPropertyNames(json.data).map(name => {
          sensor_type.push({
            title: json.data[name].title,
            type: json.data[name].type
          });
          let fields = Object.getOwnPropertyNames(json.data[name].fields).map(
            fname => {
              return json.data[name].fields[fname];
            }
          );
          let ob = {};
          ob[json.data[name].type] = fields;
          sensor_type_field.push(ob);
          return null;
        });
        this.setState({
          ...this.state,
          sensor_info: {
            sensor_type: sensor_type,
            sensor_type_field: sensor_type_field
          },
          isLoading: false
        });
      })
      .catch(err => {
        console.log("error while fetching sensor information", err);
      });
  }
  make_fields() {
    if (!this.state.selected_field) {
      return null;
    } else {
      let _fields = this.state.sensor_info.sensor_type_field.filter(ob =>
        ob.hasOwnProperty(this.state.selected_field)
      )[0]; //*

      return (
        <Field name="field" component={SelectField} floatingLabelText="Fields">
          {_fields[this.state.selected_field].map((ob, i) => {
            return <MenuItem key={i} primaryText={ob.title} value={ob.title} />;
          })}
        </Field>
      );
    }
  }
  render() {
    if (this.state.isLoading) {
      return <LinearProgress style={{ width: "200px" }} />;
    }

    return (
      <span>
        <Field
          name="sensor_type"
          component={SelectField}
          floatingLabelText="Sensor Type"
          disabled={this.props.inactivity}
          onChange={value => {
            let val = "";
            Object.getOwnPropertyNames(value).map(name => {
              name = Number.parseInt(name, 10);
              if (typeof name === "number" && !isNaN(name)) {
                val += value[name];
              }
              return null;
            });
            this.setState({ ...this.state, selected_field: val || null });
            if (val === "all") this.props.switch_inactivity(true);
          }}
        >
          {this.state.sensor_info.sensor_type.map((ob, key) => {
            return (
              <MenuItem value={ob.type} primaryText={ob.title} key={key} />
            );
          })}
        </Field>
        <br />
        {this.state.selected_field !== "all" && this.make_fields()}
      </span>
    );
  }
}
export default /**
 * @name SensorTypeField
 * @example <SensorTypeField/>
 * @description redux-form's Field based component for edit/create
 * components(AOR) of alert-type. It records the sensor-type and their fields
 */
SensorTypeField;
