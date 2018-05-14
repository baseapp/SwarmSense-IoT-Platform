/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import { Field, FieldArray } from "redux-form";
import React from "react";
import { SelectField, TextField } from "redux-form-material-ui";
import FlatButton from "material-ui/FlatButton";
import MenuItem from "material-ui/MenuItem";
import { getSensorDataTypes } from "../rest";

/**
 * @example <ConfigFieldsRenderer/>
 * @description FieldArray(redux-form) based custom input component to record
 * various configuration fields for the sensor-type
 * @extends React.Component
 */
class ConfigFieldsRenderer extends React.Component {
  constructor(props) {
    super(props);
    if (this.props.view === "edit") {
      this.disabled_ids =
        props.fields.length > 0 ? props.fields.map((_, index) => index) : [];
    } else {
      this.disabled_ids = [];
    }
    // console.log(this.disabled_ids)
  }
  render() {
    let { fields } = this.props;
    // console.log(this.props)
    return (
      <div>
        <span>You can add upto 20 configuration fields</span>
        <FlatButton
          label={`Add config. fields`}
          onClick={() => {
            fields.push({});
          }}
          disabled={fields.length >= 20 ? true : false}
          primary
        />
        <ol>
          {fields.length > 0 &&
            fields.map((member, index, fields) => {
              return (
                <li key={index}>
                  <Field
                    name={`${member}.name`}
                    component={TextField}
                    floatingLabelText="Name"
                    disabled={index in [...this.disabled_ids] ? true : false}
                  />&nbsp;
                  <Field
                    name={`${member}.description`}
                    component={TextField}
                    floatingLabelText="Description"
                    disabled={index in [...this.disabled_ids] ? true : false}
                  />&nbsp;
                  <Field
                    name={`${member}.field_type`}
                    component={SelectField}
                    floatingLabelText="Field type"
                    style={{ position: "relative", bottom: "-15px" }}
                    disabled={index in [...this.disabled_ids] ? true : false}
                  >
                    <MenuItem primaryText="Select" value="select" />
                    <MenuItem primaryText="Text" value="text" />
                    <MenuItem primaryText="Int(Text)" value="int(text)" />
                    <MenuItem
                      primaryText="Decimal(Text)"
                      value="decimal(text)"
                    />
                  </Field>&nbsp;
                  <Field
                    name={`${member}.default`}
                    component={TextField}
                    floatingLabelText="Default values"
                    disabled={index in [...this.disabled_ids] ? true : false}
                  />&nbsp;
                  <Field
                    name={`${member}.options`}
                    component={TextField}
                    floatingLabelText="Options"
                    disabled={index in [...this.disabled_ids] ? true : false}
                  />&nbsp;
                  <FlatButton
                    label="Remove"
                    onClick={() => {
                      fields.remove(index);
                    }}
                    primary
                    disabled={index in [...this.disabled_ids] ? true : false}
                  />
                </li>
              );
            })}
        </ol>
      </div>
    );
  }
}
/**
 * @description FieldArray(redux-form) based custom input component to record
 * various fields for the sensor-type
 */
class FieldsRenderer extends React.Component {
  constructor(props) {
    super(props);
    if (this.props.view === "edit") {
      this.disabled_ids =
        props.fields.length > 0 ? props.fields.map((_, index) => index) : [];
    } else {
      this.disabled_ids = [];
    }
    this.state = { data_types: [] };
    // console.log(this.disabled_ids)
  }
  async componentDidMount() {
    let data = await getSensorDataTypes();
    this.setState({ ...this.state, data_types: data });
  }
  render() {
    let { fields } = this.props;
    // console.log(fields)
    return (
      <div>
        <span>You can add upto 20 fields</span>
        <FlatButton
          label={`Add fields`}
          onClick={() => {
            fields.push({});
          }}
          disabled={fields.length >= 20 ? true : false}
          primary
        />
        <ol>
          {fields.length > 0 &&
            fields.map((member, index, fields) => {
              return (
                <li key={index}>
                  <Field
                    name={`${member}.name`}
                    component={TextField}
                    floatingLabelText="Name"
                    disabled={index in [...this.disabled_ids] ? true : false}
                  />&nbsp;
                  <Field
                    name={`${member}.type`}
                    component={SelectField}
                    floatingLabelText="Field type"
                    style={{ position: "relative", bottom: "-15px" }}
                    disabled={index in [...this.disabled_ids] ? true : false}
                  >
                    {this.state.data_types.map((type, i) => {
                      return (
                        <MenuItem
                          value={type.alias}
                          primaryText={type.name}
                          key={i}
                        />
                      );
                    })}
                  </Field>&nbsp;
                  <Field
                    name={`${member}.weight`}
                    component={TextField}
                    floatingLabelText="Weight"
                    disabled={index in [...this.disabled_ids] ? true : false}
                  />&nbsp;
                  <Field
                    name={`${member}.description`}
                    component={TextField}
                    floatingLabelText="Description"
                    disabled={index in [...this.disabled_ids] ? true : false}
                  />&nbsp;
                  <FlatButton
                    label="Remove"
                    primary
                    onClick={() => {
                      fields.remove(index);
                    }}
                    disabled={index in [...this.disabled_ids] ? true : false}
                  />
                </li>
              );
            })}
        </ol>
      </div>
    );
  }
}

class SensorTypeInput extends React.Component {
  render() {
    return (
      <div>
        <Field name="title" component={TextField} floatingLabelText="Title" />
        <br />
        <Field
          name="status_timeout"
          component={TextField}
          floatingLabelText="Status Timeout"
        />
        <br />
        <FieldArray name="fields" component={FieldsRenderer} />
        <FieldArray name="config_fields" component={ConfigFieldsRenderer} />
      </div>
    );
  }
}
export default /**
 * @name SensorTypeInput
 * @description React component to create form for making a sensor-type. Uses
 * custom input components FieldsRenderer and ConfigFieldsRenderer.
 */
SensorTypeInput;
