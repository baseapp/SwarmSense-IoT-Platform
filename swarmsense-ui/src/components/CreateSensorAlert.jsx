/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import { SimpleForm, Create } from "admin-on-rest";
import LinearProgress from "material-ui/LinearProgress";
import { DependentInput } from "aor-dependent-input";
import { Fields } from "redux-form";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";
import FlatButton from "material-ui/FlatButton";
import { resolveIfSensor } from "../utils";
import { rest_client } from "../rest";
import InjectParams from "./InjectParams";
import Forwarder from "./Forwarder";

/**
 * Makes input fields for selecting alert, actuators while creating sensor-alert.
 */

class FieldSelectAlert extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading_sensors: false, sensors: null };
  }

  /**
   * load_sensors - Fetches the sensor from the backend filtered using the currently selected alert.
   *
   * @param  {Object} newProps
   */

  load_sensors(newProps) {
    let { alert_ids, cid, alerts } = newProps,
      current_alert = alert_ids.input.value
        ? alerts.filter(({ id }) => alert_ids.input.value === id)[0]
        : null,
      is_trigger =
        current_alert && current_alert.action_type === "trigger" ? true : false;
    if (is_trigger) {
      this.setState({ ...this.state, loading_sensors: true }, async () => {
        try {
          let { data: sensors } = await rest_client(
            "GET_LIST",
            `companies/${cid}/sensors`,
            {
              pagination: { page: 1, perPage: 250 },
              filter: { type: current_alert.actuator_type }
            }
          );
          this.setState({ ...this.state, loading_sensors: false, sensors });
        } catch (e) {
          this.setState({
            ...this.state,
            loading_sensors: false,
            sensors: [],
            error: e.message || "Error while fetching sensors"
          });
        }
      });
    }
  }
  componentWillReceiveProps(newProps) {
    let { alert_ids: { input: { value: old_alert_ids } } } = this.props,
      { alert_ids: { input: { value: new_alert_ids } } } = newProps;
    if (old_alert_ids !== new_alert_ids) {
      this.load_sensors(newProps);
    }
  }
  render() {
    let { alerts, alert_ids, actuator_id } = this.props;
    if (alerts.length === 0) {
      return <div>No alert is found matching this sensor type!!</div>;
    } else {
      return (
        <div>
          <SelectField
            floatingLabelText="Select alert"
            value={alert_ids.input.value}
            onChange={(e, k, value) => {
              alert_ids.input.onChange(value);
            }}
          >
            {alerts.map(({ id, name }) => {
              return (
                <MenuItem
                  primaryText={name.toUpperCase()}
                  value={id}
                  key={id}
                />
              );
            })}
          </SelectField>
          <FlatButton
            label="Clear"
            onClick={() => {
              actuator_id.input.onChange(null);
              alert_ids.input.onChange(null);
              this.setState({ ...this.state, sensors: null });
            }}
            disabled={!alert_ids.input.value}
            secondary
          />
          <br />
          {this.state.loading_sensors && <LinearProgress />}
          {this.state.sensors && (
            <div>
              <SelectField
                floatingLabelText="Select actuator"
                value={actuator_id.input.value}
                onChange={(e, k, value) => {
                  actuator_id.input.onChange(value);
                }}
              >
                {this.state.sensors.map(({ id, name }) => {
                  return (
                    <MenuItem
                      primaryText={name.toUpperCase()}
                      value={id}
                      key={id}
                    />
                  );
                })}
              </SelectField>
              <FlatButton
                style={{ marginBottom: "10px" }}
                label="Clear"
                onClick={() => {
                  actuator_id.input.onChange(null);
                }}
                secondary
                disabled={!actuator_id.input.value}
              />
            </div>
          )}
        </div>
      );
    }
  }
}
class SensorsAlertsCreate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      error: "",
      alerts: []
    };
  }
  async componentDidMount() {
    try {
      let { sensor: { type: sensor_type } } = this.props,
        { data: alerts_1 } = await rest_client("GET_LIST", "company_alerts", {
          pagination: { page: 1, perPage: 100 },
          sort: {},
          filter: { sensor_type }
        }),
        { data: alerts_2 } = await rest_client("GET_LIST", "company_alerts", {
          pagination: { page: 1, perPage: 100 },
          sort: {},
          filter: { sensor_type: "all" }
        }),
        alerts = alerts_1.concat(alerts_2);
      this.setState({ ...this.state, loading: false, alerts });
    } catch (e) {
      this.setState({
        ...this.state,
        error: e.message || "Error while fetching sensor info",
        loading: false
      });
    }
  }

  render() {
    if (this.state.loading) {
      return <LinearProgress />;
    }
    if (this.state.error) {
      return <div>{this.state.error}</div>;
    }
    let {
      global_company: { id: cid },
      sensor: { name },
      ...rest_props
    } = this.props;
    return (
      <Create {...rest_props} title={`Assign alerts to sensor-${name}`}>
        <SimpleForm redirect="list">
          <Fields
            names={["alert_ids", "actuator_id"]}
            component={FieldSelectAlert}
            alerts={this.state.alerts}
            sensorInfo={this.props.sensor}
            cid={cid}
          />
        </SimpleForm>
      </Create>
    );
  }
}

export default /**
 * @name SensorsAlertsCreate
 * @example <SensorsAlertsCreate/>
 * @description Create the form for assigning alerts(multiple) to a sensor
 */
props => (
  <InjectParams
    resolve={resolveIfSensor}
    OnFailResolve={
      <Forwarder to="/company_sensor" message="Sensor not found" />
    }
  >
    <SensorsAlertsCreate {...props} />
  </InjectParams>
);
