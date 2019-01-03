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
import HelpIcon from "material-ui/svg-icons/action/help";
import {cyan300} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';

class WrapperComponent extends React.Component {
  constructor(props) {
    super(props);
    props.alert_type.input.value = props.type.input.value ? props.type.input.value : 0;
    if (props.alert_type.input.value == 'inactivity') {
      props.alert_type.input.value = 1;
    }
    else if (props.alert_type.input.value == 'geofencing') {
      props.alert_type.input.value = 2;
    } else {
      props.alert_type.input.value = 0;
    }
    this.state = {
      inactivity: this.props.type.input.value === "inactivity" ? true : false,
      geofencing: this.props.type.input.value === "geofencing" ? true : false,
      sensor_types: {},
      sensor_type_selected: null,
      sensor_type_field_selected: null,
      alert_type_selected: this.props.alert_type.input.value
    };
  }
  componentWillReceiveProps(newProps) {
    let inactivity = newProps.type.input.value === "inactivity" ? true : false,
      geofencing = newProps.type.input.value === "geofencing" ? true : false;
    this.setState({ ...this.state, inactivity, geofencing });
    newProps.alert_type.input.value = this.state.alert_type_selected;
    if(newProps.alert_type.input.value == '')
      newProps.alert_type.input.value=0;
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

  selectionRenderer = (value) => {
    if(value == 0 && this.props.sensor_type.input.value == 'all') {
      this.props.type.input.onChange(null);
      this.props.sensor_type.input.onChange(null);
    }
    if(value == 1) {
      this.props.type.input.onChange("inactivity");
      this.props.sensor_type.input.onChange("all");
    }
    if(value == 2) {
      this.props.type.input.onChange("geofencing");
      this.props.sensor_type.input.onChange("all");
    }
  }

  render() {
    // console.log(this.props, "props")
    let type = (
      <div>
      <SelectField
        floatingLabelText="Type"
        onChange={(e, k, v) => {
          this.props.type.input.onChange(v);
        }}
        value={this.props.type.input.value}
        style={{ display: 'inline-block' }}
      >
        <MenuItem value="lt" primaryText="Less Than" />
        <MenuItem value="lte" primaryText="Less Than or Equal To" />
        <MenuItem value="eq" primaryText="Equal To" />
        <MenuItem value="neq" primaryText="Not Equal To" />
        <MenuItem value="gt" primaryText="Greater Than" />
        <MenuItem value="gte" primaryText="Greater Than or Equal To" />
      </SelectField>
      <IconButton tooltip="Type" style={{ display: 'inline-block', marginLeft: 64, position: 'absolute', marginTop: 15 }}  >
      <HelpIcon color={cyan300} />
      </IconButton>
      </div>
    );

    let show_sensor_type =
        this.state.inactivity || this.state.geofencing ? false : true,
      sensor_type = show_sensor_type ? (
        <div>
          {this.state.sensor_types && (
            <div>
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
              style={{ display: 'inline-block' }}
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
            <IconButton tooltip="Sensor Type" style={{ display: 'inline-block', marginLeft: 64, position: 'absolute', marginTop: 15 }}  >
            <HelpIcon color={cyan300} />
            </IconButton>
            </div>
          )}
          {this.state.sensor_types &&
            this.state.sensor_type_selected &&
            this.state.sensor_types[this.state.sensor_type_selected] && (
              <div>
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
                style={{ display: 'inline-block' }}
              >
                {this.state.sensor_types[this.state.sensor_type_selected] && Object.getOwnPropertyNames(
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
              <IconButton tooltip="Field" style={{ display: 'inline-block', marginLeft: 64, position: 'absolute', marginTop: 15 }}  >
              <HelpIcon color={cyan300} />
              </IconButton>
              </div>
            )}
        </div>
      ) : (
        undefined
      );
    return (
      <div>
        <SelectField
          floatingLabelText="Alert Type"
          onChange={(e, k, v) => {
            this.setState(
              { ...this.state, alert_type_selected: v },
              () => {
                this.props.alert_type.input.onChange(v);
              }
            );
          }}
          value={this.props.alert_type.input.value}
          selectionRenderer={this.selectionRenderer(this.props.alert_type.input.value)}
          style={{ display: 'inline-block' }}
        >
          <MenuItem value={0} primaryText="Standard Alert" />
          <MenuItem value={1} primaryText="Inactivity Alert" />
          <MenuItem value={2} primaryText="Geofencing Alert" />
        </SelectField>
        <IconButton tooltip="Alert Type" style={{ display: 'inline-block', marginLeft: 64, position: 'absolute', marginTop: 15 }}  >
        <HelpIcon color={cyan300} />
        </IconButton>
        <br />
        {show_sensor_type && sensor_type}
        {show_sensor_type && type}
      </div>
    );
  }
}
const AlertTypeField = props => (
  <Fields
    names={["type", "value", "field", "sensor_type", "alert_type"]}
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
