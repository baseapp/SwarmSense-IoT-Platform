/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import { Fields } from "redux-form";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";
import TextField from "material-ui/TextField";
import LinearProgress from "material-ui/LinearProgress";
import { getAllSensorTypes } from "../rest";
import HelpIcon from "material-ui/svg-icons/action/help";
import {cyan300} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';

/**
 * An input for selecting config fields.
 */

class FieldConfigSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = { sensor_types: [], loading: true, error: "" };
  }
  async componentDidMount() {
    try {
      let sensor_types = await getAllSensorTypes();
      sensor_types = Object.getOwnPropertyNames(sensor_types)
        .filter(type => {
          if (
            sensor_types[type]["config_fields"] &&
            Object.getOwnPropertyNames(sensor_types[type]["config_fields"])
              .length >= 1 &&
            Object.getOwnPropertyNames(
              sensor_types[type]["config_fields"]
            ).every(field => {
              if (sensor_types[type]["config_fields"][field]["name"]) {
                return true;
              } else {
                return false;
              }
            })
          ) {
            return true;
          } else {
            return false;
          }
        })
        .map(type => sensor_types[type]);
      this.setState({ ...this.state, loading: false, sensor_types });
    } catch (e) {
      this.setState({
        ...this.state,
        error: e.message || "Error while fetching sensor types",
        loading: false
      });
    }
  }
  render() {
    // console.log(this.state.sensor_types, "sensor_types");
    if (this.state.loading) {
      return <LinearProgress />;
    } else if (this.state.error) {
      return <div>{this.state.error}</div>;
    } else {
      return (
        <Fields
          names={["actuator_type", "config_field", "config_value"]}
          sensorTypes={this.state.sensor_types}
          component={props => {
            // console.log("rendering inside component");
            let {
              sensorTypes,
              actuator_type,
              config_field,
              config_value
            } = props;
            // console.log("props", props);
            let selected_sensor_type_array = sensorTypes.filter(stype => {
              if (
                actuator_type.input.value &&
                stype.type === actuator_type.input.value
              ) {
                return true;
              } else {
                return false;
              }
            });
            // console.log(
            //   "selected_sensor_type_array",
            //   selected_sensor_type_array
            // );
            let config_fields =
              selected_sensor_type_array.length === 1
                ? selected_sensor_type_array[0].config_fields
                : null;
            // console.log(
            //   "config_fields, config_field",
            //   config_fields,
            //   config_field
            // );
            let config_values =
              config_field.input.value &&
              config_fields &&
              config_fields[config_field.input.value] &&
              config_fields[config_field.input.value]["field_type"] &&
              config_fields[config_field.input.value].field_type === "select"
                ? config_fields[config_field.input.value].options.split(",")
                : null;
            // console.log("config_values", config_values);
            let config_text_field =
              config_field.input.value &&
              config_fields &&
              config_fields[config_field.input.value] &&
              config_fields[config_field.input.value]["field_type"] &&
              config_fields[config_field.input.value].field_type !== "select"
                ? true
                : false;
            // console.log("config_text_field", config_text_field);
            return (
              <div>
                <SelectField
                  floatingLabelText="Actuator type"
                  value={actuator_type.input.value}
                  onChange={(e, k, value) => {
                    actuator_type.input.onChange(value);
                  }}
                  style={{ display: 'inline-block' }}
                >
                  {sensorTypes.map((stype, key) => {
                    return (
                      <MenuItem
                        key={key}
                        primaryText={stype.title}
                        value={stype.type}
                      />
                    );
                  })}
                </SelectField>
                <IconButton tooltip="Actuator Type" style={{ display: 'inline-block', marginLeft: 64, position: 'absolute', marginTop: 15 }}  >
                <HelpIcon color={cyan300} />
                </IconButton>
                <br />
                {config_fields && (
                  <div>
                  <SelectField
                    floatingLabelText="Config parameter"
                    value={config_field.input.value}
                    onChange={(e, k, value) =>
                      config_field.input.onChange(value)
                    }
                    style={{ display: 'inline-block' }}
                  >
                    {Object.getOwnPropertyNames(config_fields).map(
                      (name, key) => (
                        <MenuItem key={key} primaryText={name} value={name} />
                      )
                    )}
                  </SelectField>
                  <IconButton tooltip="Config Parameter" style={{ display: 'inline-block', marginLeft: 64, position: 'absolute', marginTop: 15 }}  >
                  <HelpIcon color={cyan300} />
                  </IconButton>
                  </div>
                )}
                {config_values && (
                  <div>
                  <SelectField
                    value={config_value.input.value}
                    floatingLabelText="Change config value to"
                    onChange={(e, key, value) => {
                      config_value.input.onChange(value);
                    }}
                  >
                    {config_values.map((value, key) => {
                      return (
                        <MenuItem key={key} primaryText={value} value={value} />
                      );
                    })}
                  </SelectField>
                  <IconButton tooltip="Config Values" style={{ display: 'inline-block', marginLeft: 64, position: 'absolute', marginTop: 15 }}  >
                  <HelpIcon color={cyan300} />
                  </IconButton>
                  </div>
                )}
                {config_text_field && (
                  <div>
                  <TextField
                    value={config_value.input.value}
                    onChange={(e, value) => config_value.input.onChange(value)}
                    floatingLabelText="Change config value to"
                    style={{ display: 'inline-block' }}
                  />
                  <IconButton tooltip="Config Values" style={{ display: 'inline-block', marginLeft: 64, position: 'absolute', marginTop: 15 }}  >
                  <HelpIcon color={cyan300} />
                  </IconButton>
                  </div>
                )}
              </div>
            );
          }}
        />
      );
    }
  }
}

export default FieldConfigSelector;
