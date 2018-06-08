/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import { Fields } from "redux-form";
import MenuItem from "material-ui/MenuItem";
import SelectField from "material-ui/SelectField";
import Toggle from "material-ui/Toggle";
import TextField from "material-ui/TextField";
import { getAllSensorTypes } from "../rest";

class WrapperComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inactivity: this.props.type.input.value === "inactivity" ? true : false,
      geofencing: this.props.type.input.value === "geofencing" ? true : false,
      sensor_types: {},
      sensor_type_selected: null,
      sensor_type_field_selected: null
    };
  }
  componentWillReceiveProps(newProps) {
    let inactivity = newProps.type.input.value === "inactivity" ? true : false,
      geofencing = newProps.type.input.value === "geofencing" ? true : false;
    this.setState({ ...this.state, inactivity, geofencing });
  }
  async componentDidMount() {
    try {
      let sensor_types = await getAllSensorTypes();
      let {
        sensor_type: { input: { value: sensor_type_selected } },
        field: { input: { value: sensor_type_field_selected } }
      } = this.props;
      if ((sensor_type_selected, sensor_type_field_selected)) {
        this.setState({
          ...this.state,
          sensor_types,
          sensor_type_selected,
          sensor_type_field_selected
        });
      } else {
        this.setState({ ...this.state, sensor_types });
      }
    } catch (err) {
      console.log(err);
      throw err; // improvise
    }
  }
  render() {
    // console.log(this.props, "props")
    let type = (
      <SelectField
        floatingLabelText="Type"
        onChange={(e, k, v) => {
          this.props.type.input.onChange(v);
        }}
        value={this.props.type.input.value}
      >
        <MenuItem value="lt" primaryText="Less Than" />
        <MenuItem value="lte" primaryText="Less Than or Equal To" />
        <MenuItem value="gt" primaryText="Greater Than" />
        <MenuItem value="gte" primaryText="Greater Than or Equal To" />
      </SelectField>
    );

    let show_sensor_type =
        this.state.inactivity || this.state.geofencing ? false : true,
      sensor_type = show_sensor_type ? (
        <div>
          {this.state.sensor_types && (
            <SelectField
              floatingLabelText="Sensor-type"
              onChange={(e, k, v) => {
                this.setState(
                  { ...this.state, sensor_type_selected: v },
                  () => {
                    this.props.sensor_type.input.onChange(v);
                  }
                );
              }}
              value={this.props.sensor_type.input.value}
            >
              {Object.getOwnPropertyNames(this.state.sensor_types).map(
                (name, i) => {
                  return (
                    <MenuItem
                      key={i}
                      primaryText={this.state.sensor_types[name].title}
                      value={this.state.sensor_types[name].type}
                    />
                  );
                }
              )}
            </SelectField>
          )}
          <br />
          {this.state.sensor_types &&
            this.state.sensor_type_selected && (
              <SelectField
                floatingLabelText="Field"
                onChange={(e, k, v) => {
                  this.setState(
                    { ...this.state, sensor_type_field_selected: v },
                    () => {
                      this.props.field.input.onChange(v);
                    }
                  );
                }}
                value={this.props.field.input.value}
              >
                {Object.getOwnPropertyNames(
                  this.state.sensor_types[this.state.sensor_type_selected]
                    .fields
                ).map((name, i) => {
                  let field = this.state.sensor_types[
                    this.state.sensor_type_selected
                  ].fields[name];
                  // console.log(field)
                  return (
                    <MenuItem
                      key={i}
                      primaryText={field.name || field.title}
                      value={field.name || field.title}
                    />
                  );
                })}
              </SelectField>
            )}
        </div>
      ) : (
        undefined
      );
    return (
      <div>
        <Toggle
          toggled={this.state.inactivity}
          label="Inactivity Alert"
          style={{ width: "250px" }}
          onToggle={(e, checked) => {
            this.setState({ inactivity: checked }, () => {
              if (checked) {
                this.props.type.input.onChange("inactivity");
                this.props.sensor_type.input.onChange("all");
              } else {
                this.props.type.input.onChange(null);
                this.props.sensor_type.input.onChange(null);
              }
            });
          }}
        />
        <Toggle
          toggled={this.state.geofencing}
          label="Geofencing Alert"
          style={{ width: "250px" }}
          onToggle={(e, checked) => {
            this.setState({ geofencing: checked }, () => {
              if (checked) {
                this.props.type.input.onChange("geofencing");
                this.props.sensor_type.input.onChange("all");
              } else {
                this.props.type.input.onChange(null);
                this.props.sensor_type.input.onChange(null);
              }
            });
          }}
        />
        <br />
        {show_sensor_type && sensor_type}
        {show_sensor_type && type}
      </div>
    );
  }
}
const AlertTypeField = props => (
  <Fields
    names={["type", "value", "field", "sensor_type"]}
    component={WrapperComponent}
  />
);

export default /**
@name AlertTypeField
@description A field for the alert create/edit representing the type.
@returns {Object} redux-form's Field component to record the type
@example <AlertsTypeField/>
*/
AlertTypeField;
