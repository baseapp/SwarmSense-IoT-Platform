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
  Datagrid,
  TextField,
  FunctionField,
  showNotification
} from "admin-on-rest";
import { Responsive } from "admin-on-rest";
import FlatButton from "material-ui/FlatButton";
import PropTypes from "prop-types";
import MenuItem from "material-ui/MenuItem";
import Dialog from "material-ui/Dialog";
import CircularProgress from "material-ui/CircularProgress";
import AutoComplete from "material-ui/AutoComplete";
import InjectParams from "./InjectParams";
import Forwarder from "./Forwarder";
import { SimpleList, ActionPanel } from "./index.js";
import { set_params, moments_ago, resolveIfCompany } from "../utils";
import { getSensors, rest_client as restClient } from "../rest";
import EditButton from "./EditButton";
class SensorType extends React.Component {
  // SensorType component for getting name of the sensor.
  constructor(props) {
    super(props);
    this.state = {
      sensor_name: undefined,
      loading: false
    };
  }
  componentDidMount() {
    this.setState({ ...this.state, loading: true }, () => {
      restClient("GET_ONE", "sensor_types", {
        id: this.props.sensorId
      })
        .then(data => {
          this.setState({
            ...this.state,
            loading: false,
            sensor_name: data.data.title
          });
        })
        .catch(err => {
          showNotification(err.message, "warning");
          this.setState({ ...this.state, loading: false });
        });
    });
  }
  render() {
    if (this.state.loading) {
      return <CircularProgress thickness={2} />;
    } else if (this.state.sensor_name) {
      return <div>{this.state.sensor_name}</div>;
    } else return null;
  }
}

/**
 * Component for creating list of user dashboards available.
 * @extends React.Component
 */

class MyDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dashboard_id: "",
      select_sensor: false,
      loading: false,
      autocomplete_sensor: "",
      dataSource: [],
      autocomplete_loading: false,
      autocomplete_open_menu: false,
      selected_sensor_id: undefined
    };
  }
  render() {
    const linkStyle = {
      textTransform: "capitalize",
      textDecoration: "none",
      color: "rgb(0, 188, 212)",
      fontSize: "0.93rem"
    };
    return (
      <div>
        <List
          {...this.props}
          perPage={30}
          title="Custom Dashboards"
          actions={<ActionPanel />}
        >
          {permissions => {
            const editItems = permissions === "read" ? false : true;
            return (
              <Responsive
                small={
                  <SimpleList
                    primaryText={record => {
                      return (
                        record.dashboard_type === "device-general" ? (
                          <a
                            style={linkStyle}
                            onClick={() =>
                              this.setState({
                                ...this.state,
                                select_sensor: true,
                                dashboard_id: record.id,
                                sensor_type: record.sensor_type
                              })
                            }
                          >
                            {record.data.name}
                          </a>
                        ) : (
                          <a style={linkStyle} href={`/#/cdash/${record.id}`}>
                            {record.data.name}
                          </a>
                        )
                      );
                    }}
                    onEditItem={record => set_params("cdashboard", record)}
                    editItems={editItems}
                    menuItems={record => {
                      return [
                        record.dashboard_type === "general" ? (
                          <MenuItem
                            primaryText="Browse"
                            href={`#/cdash/${record.id}`}
                            key="browse_cdash"
                          />
                        ) : (
                          <MenuItem
                            primaryText="Browse"
                            onClick={this.setState({
                              ...this.state,
                              select_sensor: true,
                              dashboard_id: record.id,
                              sensor_type: record.sensor_type
                            })}
                            key="browse_cdash"
                          />
                        )
                      ];
                    }}
                  />
                }
                medium={
                  <Datagrid>
                    <FunctionField
                      label="Title"
                      source="data.name"
                      render={({
                        id,
                        data: { name },
                        dashboard_type,
                        sensor_type
                      }) => {
                        if (dashboard_type === "device-general") {
                          return (
                            <a
                              style={linkStyle}
                              onClick={() =>
                                this.setState({
                                  ...this.state,
                                  select_sensor: true,
                                  dashboard_id: id,
                                  sensor_type
                                })
                              }
                            >
                              {name}
                            </a>
                          );
                        } else {
                          return (
                            <a style={linkStyle} href={`/#/cdash/${id}`}>
                              {name}
                            </a>
                          );
                        }
                      }}
                    />
                    <FunctionField
                      label="Category"
                      source="dashboard_type"
                      render={({ dashboard_type, sensor_type }) => {
                        if (dashboard_type === "general" || !dashboard_type) {
                          return <div>General</div>;
                        } else if (dashboard_type === "device-general") {
                          return <SensorType sensorId={sensor_type} />;
                        }
                      }}
                    />
                    <FunctionField
                      label="Created"
                      source="created_at"
                      render={({ created_at }) => {
                        let _t = new Date(created_at);
                        return moments_ago(_t);
                      }}
                    />
                    <FunctionField
                      source="updated_at"
                      label="Last update"
                      render={({ updated_at }) => {
                        let _t = new Date(updated_at);
                        return moments_ago(_t);
                      }}
                    />
                    {editItems && (
                      <EditButton
                        onClick={record => set_params("cdashboard", record)}
                      />
                    )}
                  </Datagrid>
                }
              />
            );
          }}
        </List>
        <Dialog
          open={this.state.select_sensor}
          onRequestClose={bool => {
            this.setState({ ...this.state, select_sensor: bool });
          }}
        >
          <AutoComplete
            searchText={this.state.autocomplete_sensor}
            disabled={this.state.autocomplete_loading}
            floatingLabelText="Select Sensor"
            onUpdateInput={(searchText, dataSource, params) => {
              this.onUpdateInput(searchText, dataSource, params);
            }}
            onNewRequest={(sensor_name, index) => {
              this.onNewRequest(sensor_name, index);
            }}
            dataSource={this.state.dataSource.map(sensor => sensor.name)}
            maxSearchResults={5}
            hintText="Type to search for sensor"
            filter={AutoComplete.fuzzyFilter}
            openOnFocus={true}
            open={this.state.autocomplete_open_menu}
          />
          <FlatButton
            label={
              this.state.autocomplete_loading ? (
                <CircularProgress />
              ) : (
                "Search sensors"
              )
            }
            disabled={
              this.state.autocomplete_loading || !this.state.autocomplete_sensor
            }
            onClick={() => this.loadDataSources()}
          />
          <br />
          <FlatButton
            disabled={!this.state.selected_sensor_id}
            label="Open dashboard"
            onClick={() => {
              this.context.router.history.push(
                `/cdash/${this.state.dashboard_id}/device/${
                  this.state.selected_sensor_id
                }`
              );
            }}
          />
        </Dialog>
      </div>
    );
  }

  /**
   * loadDataSources - gets the sensor from the backend.
   *
   */

  loadDataSources() {
    this.setState({ ...this.state, autocomplete_loading: true }, async () => {
      try {
        let { global_company: { id: cid } } = this.props;
        let { data: dataSource } = await getSensors({
          cid,
          name: this.state.autocomplete_sensor,
          perPage: 10,
          field: "name",
          type_id: this.state.sensor_type
        });
        this.setState({
          ...this.state,
          autocomplete_loading: false,
          dataSource,
          autocomplete_open_menu: dataSource.length >= 1 ? true : false
        });
      } catch (e) {
        this.logger("@onUpdateInput", e.message || e);
        this.setState({ ...this.state, autocomplete_loading: false });
      }
    });
  }

  /**
   * onUpdateInput - AutoComplete handler - refer to the onUpdateInput prop - {@link http://www.material-ui.com/#/components/auto-complete | here}.
   *
   */

  onUpdateInput(autocomplete_sensor, dataSource, params) {
    this.setState({ ...this.state, autocomplete_sensor });
  }

  /**
   * onNewRequest - AutoComplete handler - refer to the onNewRequest prop - {@link http://www.material-ui.com/#/components/auto-complete | here}.
   */

  onNewRequest(chosenRequest, index) {
    let sensor = this.state.dataSource.filter(
      _sensor => _sensor.name === chosenRequest
    )[0];
    this.setState({
      ...this.state,
      autocomplete_open_menu: false,
      selected_sensor_id: sensor.id
    });
  }
}
MyDashboard.contextTypes = {
  router: PropTypes.object
};
export default props => (
  <InjectParams
    resolve={resolveIfCompany}
    OnFailResolve={<Forwarder to="/#" message="No company found!" />}
  >
    <MyDashboard {...props} />
  </InjectParams>
);
