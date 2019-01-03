/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import Snackbar from "material-ui/Snackbar";
import TextField from "material-ui/TextField";
import Paper from "material-ui/Paper";
import { ViewTitle } from "admin-on-rest";
import LinearProgress from "material-ui/LinearProgress";
import { Card, CardTitle, CardText, CardActions } from "material-ui/Card";
import FlatButton from "material-ui/FlatButton";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";
import { orange500 } from "material-ui/styles/colors";
import PropTypes from "prop-types";
import { rest_client as restClient } from "../rest";
import { parse_query } from "../utils";
import { resolveIfSensor } from "../utils";
import Forwarder from "./Forwarder";
import InjectParams from "./InjectParams";
/**
 * @name SensorConfigurationEdit
 * @description A react component to edit the sensor configuration.
 */
class SensorConfigurationEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      data: [],
      sensor_config: [],
      sensor_type: undefined,
      snackbar: {
        error: false,
        message: "",
        autoHideDuration: 4000,
        open: false,
        error_code: undefined
      }
    };
  }
  /***
   * show the message to the user
   * @param {string} message the message to show to the user
   */
  alert_user(mesg) {
    this.setState({
      ...this.state,
      snackbar: {
        ...this.state.snackbar,
        message: mesg,
        open: true
      }
    });
    //console.log("statee", this.state)
  }
  /***
   * show the error message to the user(with proper formatting)
   * @param {String} message error message to show to user
   */
  alert_user_error(mesg, code = undefined) {
    this.setState({
      ...this.state,
      snackbar: {
        ...this.state.snackbar,
        message: mesg,
        open: true,
        error: true,
        error_code: code
      }
    });
    //console.log("state", this.state)
  }
  /***
   * finds if the state's loading is on or off
   * @return {Boolean} true if state has loading on else false
   */
  isLoading() {
    return this.state.isLoading ? true : false;
  }
  /***
   * Saves the information stored about the sensor configuration.
   * Creates the request(update) and send the latest sensor-config to the endpoint.
   * And after that notifies the user accordingly.
   */
  save_configuration() {
    let { sensor: { id: sid } } = this.props;
    // console.log(sid)
    if (sid) {
      let data = {};
      this.state.data.map(ob => {
        data[ob.name] = ob.value;
        return null;
      });
      restClient("UPDATE", `sensors/${sid}/configuration`, { data: data })
        .then(json => {
          this.context.router.history.push("/company_sensors");
          this.alert_user("Element Updated.");
        })
        .catch(err => {
          console.log(err);
          this.alert_user_error("Error occurred!");
        });
    } else {
      this.alert_user_error("Error occured! Sensor not found!");
    }
  }
  /***
   * Requests the sensor-configuration information from the endpoint
   * @returns {Promise} resolves into the sensor-configuration info
   */
  get_sensor_config_information() {
    let { sensor: { type, config: sensor_config, id: id } } = this.props;
    return restClient("GET_ONE", "sensor_types_all", { id: type }).then(
      ({ data: { config_fields: config } }) => {
        restClient("GET_ONE", "companies/cid/sensors", { id: id}).then( response => {
          let data = [];
          Object.getOwnPropertyNames(config).map(config_name => {
            let _config = { name: config_name, type: config[config_name] };
            if (sensor_config.hasOwnProperty(config_name)) {
                _config.value = response.data.config[config_name];
            }
            data.push(_config);
            this.setState({ ...this.state, data: data, isLoading: false  });
          });
        });
      }
    );
  }
  /***
   * gets the configuration data for a particular configuation field
   * @param id represents a configuration field
   */
  get_data(id) {
    return this.state.data[id];
  }
  /***
   * sets the configuration data for a particular configuation field
   * @param id represents a configuration field
   * @param {string} value value of the configuration field
   */
  set_data(id, value) {
    let data = this.state.data;
    //console.log(id, value, this.state)
    data[id] = { name: data[id].name, value: value, type: data[id].type };
    //console.log(data)
    this.setState({ ...this.state, data: data });
    //console.log(this.state,'okay?')
  }
  /***
   * creates the input fields for all the configuration fields
   */
  make_fields() {
    //console.log("state",this.state)
    let data = this.state.data.slice();
    // data.sort((a, b) => {
    //   return b.type.weight - a.type.weight;
    // });
    return data.map((ob, i) => {
      if (ob.type.field_type === "select") {
        //console.log('dd',ob)
        return (
          <SelectField
            key={i}
            value={this.get_data(i).value}
            onChange={(e, k, v) => {
              this.set_data(i, v);
            }}
            floatingLabelText={ob.name}
            errorText={ob.type.description}
            errorStyle={{ color: orange500 }}
            fullWidth={true}
            autoWidth={true}
          >
            {ob.type.options.split(",").map((it, j) => {
              let [value, text, ...other_items] = it.split("|");
              if (other_items.length >= 1) {
                text = [text, ...other_items].join("|");
              }
              return (
                <MenuItem value={value} primaryText={text || value} key={j} />
              );
            })}
          </SelectField>
        );
      } else {
        return (
          <TextField
            key={i}
            floatingLabelText={ob.name}
            onChange={(eve, nval) => this.set_data(i, nval)}
            value={this.get_data(i).value}
            errorText={ob.type.description}
            errorStyle={{ color: orange500 }}
            fullWidth={true}
            autoWidth={true}
          />
        );
      }
    });
  }
  componentDidMount() {
    let { sensor: { id: sid, type } } = this.props;
    if (sid) {
      this.get_sensor_config_information().then(() => {
        //this.setState({ ...this.state, isLoading: false });
      });
    }
  }
  render() {
    let snackbar = (
      <Snackbar
        open={this.state.snackbar.open}
        message={this.state.snackbar.message}
        autoHideDuration={this.state.snackbar.autoHideDuration}
      />
    );
    let { sensor: { id: sid } } = this.props;
    if (!sid) {
      return <div>Sensor not found</div>;
    }
    if (this.isLoading()) {
      return (
        <Paper>
          <LinearProgress />
          {snackbar}
        </Paper>
      );
    } else {
      let fields = this.make_fields();
      let fields_length = fields.length;
      fields = (
        <Card>
          <ViewTitle title="Edit Configuration" />
          <CardText>{fields}</CardText>
          <CardActions>
            <FlatButton
              onClick={() => this.save_configuration()}
              label="Save"
              secondary={true}
            />
            <FlatButton
              href={`#/company_sensors/${sid}`}
              label="Cancel"
              secondary={true}
            />
          </CardActions>
        </Card>
      );
      return (
        <Paper>
          {fields_length > 0 ? (
            fields
          ) : (
            <Card>
              <ViewTitle title="Edit Configuration" />
              <CardText>No data found</CardText>{" "}
            </Card>
          )}
          {snackbar}
        </Paper>
      );
    }
  }
}
SensorConfigurationEdit.contextTypes = {
  router: PropTypes.object
};
export default props => (
  <InjectParams
    resolve={resolveIfSensor}
    OnFailResolve={<Forwarder to="/" message="Select sensor first!!" />}
  >
    <SensorConfigurationEdit {...props} />
  </InjectParams>
);
