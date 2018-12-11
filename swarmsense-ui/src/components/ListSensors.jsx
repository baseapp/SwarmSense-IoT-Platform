/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import { List, Datagrid, FunctionField, TextField } from "admin-on-rest";
import { Responsive } from "admin-on-rest";
import { connect } from "react-redux";
import LinearProgress from "material-ui/LinearProgress";
import CircularProgress from "material-ui/CircularProgress";
import Checkbox from "material-ui/Checkbox";
import FlatButton from "material-ui/FlatButton";
import { showNotification } from "admin-on-rest";
import Dialog from "material-ui/Dialog";
import { red500, green500 } from "material-ui/styles/colors";
import ActionLightbulbOutline from "material-ui/svg-icons/action/lightbulb-outline";
import MenuItem from "material-ui/MenuItem";
import PropTypes from "prop-types";
import SelectField from "material-ui/SelectField";
import {
  SimpleList,
  SelectNetwork as NetworkSelect,
  ActionPanel,
  FilterSensor_name as SensorFilter
} from "./index";
import EditButton from "./EditButton";
import { moments_ago, set_params, get_logger } from "../utils";
import { rest_client as restClient, getDashboards } from "../rest";
import { resolveIfCompany } from "../utils";
import Forwarder from "./Forwarder";
import InjectParams from "./InjectParams";
import PostPagination from "./PostPagination";

export /**
 * Makes the list of sensors.
 */

class SensorsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: {},
      loading: true,
      show_network_button: false,
      removing_sensors: false,
      open_network_assign: false,
      total_sensors: null,
      selected_params: [],
      showCompareSensors: false,
      select_dashboard: false,
      selected_dashboard: undefined,
      dashboards: [],
      dashboard_sensor: undefined,
      select_dashboard_loading: false
    };
    this.log = get_logger("SensorsList");
  }

  /**
   * goto_selected_dashboard - Change the current route to the selected dashboard id.
   *
   */

  goto_selected_dashboard() {
    let { dashboard_sensor, selected_dashboard } = this.state;
    if (dashboard_sensor["id"] && selected_dashboard) {
      this.context.router.history.push(
        `/cdash/${selected_dashboard}/device/${dashboard_sensor.id}`
      );
    } else {
      this.props.dispatch(showNotification("No sensor/dashboard found!"));
    }
  }

  /**
   * async load_dashboards - Pulls the list of dashboards from the backend, for a sensor.
   *
   */

  async load_dashboards() {
    try {
      let { data: sensor_types } = await restClient(
          "GET_LIST",
          "sensor_types",
          {}
        ),
        selected_sensor = sensor_types.filter(
          ({ type }) => type === this.state.dashboard_sensor.type
        );
      let selected_sensor_type = selected_sensor[0].id,
        { data: dashboards } = await getDashboards({
          cid: this.props.global_company.id,
          sensorType: selected_sensor_type
        });
      if (dashboards.length === 0) {
        this.setState(
          { ...this.state, select_dashboard_loading: false },
          () => {
            this.props.dispatch(
              showNotification("No dashboards found", "warning")
            );
          }
        );
      } else if (dashboards.length == 1) {
        this.setState(
          {
            ...this.state,
            select_dashboard_loading: false,
            dashboards,
            selected_dashboard: dashboards[0].id
          },
          () => {
            this.goto_selected_dashboard();
          }
        );
      } else {
        this.setState({
          ...this.state,
          select_dashboard: true,
          select_dashboard_loading: false,
          dashboards
        });
      }
    } catch (err) {
      this.props.dispatch(
        showNotification("Error while loading dashboards list.", "warning")
      );
      this.setState({
        ...this.state,
        select_dashboard: false,
        select_dashboard_loading: false
      });
    }
  }
  /***
   * Assigns the selected sensors to a network
   * @param {string} nid network id to which the sensors marked are to be assigned
   */
  assign_network(nid) {
    if (!this.state.show_network_button) {
      this.props.dispatch(showNotification("No sensors selected", "warning"));
    } else if (!nid) {
      this.props.dispatch(showNotification("No Network selected", "warning"));
    } else {
      let selected = Object.getOwnPropertyNames(this.state.selected);
      restClient(
        "CREATE",
        `companies/${this.props.global_company.id}/networks/${nid}/sensors`,
        { data: { sensor_ids: selected } }
      )
        .then(json => {
          this.setState({ ...this.state, open_network_assign: false });
          this.props.dispatch(showNotification("Elements created."));
        })
        .catch(err => {
          this.setState({ ...this.state, open_network_assign: false });
          this.props.dispatch(showNotification(`${err.message}`, "warning"));
          // console.log("err", err)
        });
    }
  }

  /**
   * remove_sensors_from_network - As name indicates removes the selected sensors from the network,
   * when the network sensors are being shown.
   *
   */

  remove_sensors_from_network() {
    if (this.state.show_network_button) {
      this.setState({
        ...this.state,
        removing_sensors: true,
        open_network_assign: true
      });
      let selected = Object.getOwnPropertyNames(this.state.selected);
      restClient(
        "DELETE_MANY",
        `companies/${this.props.global_company.id}/networks/${
          this.props.network.id
        }/sensors`,
        { data: { sensor_ids: selected } }
      )
        .then(json => {
          this.setState({
            ...this.state,
            removing_sensors: false,
            open_network_assign: false
          });
          this.props.dispatch(
            showNotification("Elements deleted. Refreshing...")
          );
          this.context.router.history.push("/"); // A quick fix for no-support of refresh.
          this.context.router.history.push("/company_network_sensors"); // hoping for future support of refresh functionality in admin-on-rest
        })
        .catch(err => {
          this.setState({
            ...this.state,
            removing_sensors: false,
            open_network_assign: false
          });
          this.props.dispatch(showNotification(`${err.message}`, "warning"));
          // console.log("err", err)
        });
    } else {
      this.props.dispatch(showNotification("No sensors selected!", "warning"));
    }
  }

  /**
   * compare_sensors - Compares the selected sensors using the sensor-chart route.
   *
   */

  compare_sensors() {
    // console.log(this.state)
    let selected = Object.getOwnPropertyNames(this.state.selected);
    if (selected.length >= 2 && this.state.selected_params.length >= 1) {
      set_params(
        "sensors",
        selected.map(sid => {
          return {
            name: this.state.selected[sid]["name"],
            id: sid,
            created_at: this.state.selected[sid]["created_at"]
          };
        })
      );
      set_params("params", this.state.selected_params);
      set_params("multiple", true);
      this.context.router.history.push(`sensor_chart`);
    } else {
      this.props.dispatch(
        showNotification("Select atleast two sensors to compare")
      );
    }
  }

  /**
   * make_params - get the parameters of the selected sensors
   *
   * @return {Object} - Object containing unique parameters of the selected sensors.
   */

  make_params() {
    let selected = this.state.selected,
      params = [];
    // console.log(selected)
    Object.getOwnPropertyNames(selected).map(n => {
      // be careful of the null values
      let value = selected[n].value;
      if (value) {
        Object.getOwnPropertyNames(value).map(val_name => {
          if (!params.includes(val_name)) {
            params.push(val_name);
          }
          return null;
        });
      }
      return null;
    });
    return params;
  }
  /***
   * @description marks a sensor selected/unselected
   * @param {String} id sensor id to be marked
   * @param {Boolean} value mark sensor selected or not
   */
  select_sensor(record, value) {
    let selected = this.state.selected;
    if (value) {
      selected[record.id] = record;
    } else {
      delete selected[record.id];
    }
    let network = false;
    if (Object.getOwnPropertyNames(selected).length >= 1) {
      //check if some of the sensors are selected
      network = true; // dialog of network selection must open
    }
    this.setState({ selected: selected, show_network_button: network });
  }

  /**
   * componentDidMount - Fetches the list of sensors in the network, if selected. And set them in state.
   *
   */

  componentDidMount() {
    if (this.props.network.id && this.props.nid) {
      restClient("GET_LIST", "company_network_sensors", {
        pagination: { perPage: 1, page: 1 },
        sort: {},
        filter: {}
      })
        .then(json => {
          this.setState({
            ...this.state,
            total_sensors: json.total,
            loading: false
          });
        })
        .catch(err => this.props.dispatch(showNotification(err.message)));
    } else {
      this.setState({ ...this.state, loading: false });
    }
  }
  render() {
    const editItems =
      sessionStorage.getItem("company_role") === "read" ? false : true;
    if (this.state.loading) {
      return <LinearProgress />;
    }
    let title,
      { network: { id: _nid } } = this.props;
    if (this.props.nid && _nid) {
      title = `Device list(Network-wide; Total:${this.state.total_sensors})`;
    } else {
      title = "Device List";
    }
    let customButtons = [];
    customButtons.push({
      label: "Compare devices",
      onClick: () => {
        this.setState({ ...this.state, showCompareSensors: true });
      }
    });
    if (this.props.nid && _nid) {
      if (editItems) {
        customButtons.push({
          label: "Remove Devices",
          onClick: () => {
            this.remove_sensors_from_network();
          }
        });
      }
      customButtons.push({
        label: "Map",
        href: "#/network_sensors_map"
      });
      customButtons.push({
        label: "Networks",
        href: "#/company_networks"
      });
    } else {
      if (editItems) {
        customButtons.push({
          onClick: () =>
            this.setState({ ...this.state, open_network_assign: true }),
          label: "Assign network"
        });
      }
      customButtons.push({
        label: "Map",
        href: "#/sensors_map"
      });
    }
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
          perPage={20}
          title={title}
          sort={{ field: "last_update", order: "DESC" }}
          filters={<SensorFilter />}
          actions={<ActionPanel customButtons={customButtons} />}
          pagination={<PostPagination />}
        >
          {permissions => {
            return (
              <Responsive
                small={
                  <SimpleList
                    onEditItem={record => set_params("sensor", record)}
                    editItems={editItems}
                    primaryText={record => {
                      return (
                        <a
                          style={linkStyle}
                          onClick={() => {
                            set_params("sensors", []);
                            set_params("multiple", false);
                            set_params("sensor", record);
                          }}
                          href="#/sensor_chart"
                        >
                          {record.name}
                        </a>
                      );
                    }}
                    leftCheckbox={record => {
                      return (
                        <Checkbox
                          onCheck={(eve, value) => {
                            this.select_sensor(record, value);
                          }}
                        />
                      );
                    }}
                    menuItems={record => [
                      <MenuItem
                        primaryText="History"
                        onClick={() => {
                          set_params("sensors", []);
                          set_params("multiple", false);
                          set_params("sensor", record);
                        }}
                        href="#/sensor_chart"
                        key="0"
                      />,
                      <MenuItem
                        primaryText={`Filter(${record.type})`}
                        onClick={() => {
                          set_params("sensor_type", { type: record.type });
                        }}
                        href={`#/company_sensors_by_type`}
                        key="1"
                      />,
                      <MenuItem
                        primaryText="Quick view"
                        disabled={this.state.select_dashboard_loading}
                        onClick={() => {
                          this.setState(
                            {
                              ...this.state,
                              dashboard_sensor: record,
                              select_dashboard_loading: true
                            },
                            async () => {
                              await this.load_dashboards();
                            }
                          );
                        }}
                        key="2"
                      />
                    ]}
                  />
                }
                medium={
                  <Datagrid>
                    <FunctionField
                      render={record => {
                        return (
                          <div style={{ marginLeft: "25px" }}>
                            <Checkbox
                              onCheck={(eve, value) => {
                                this.select_sensor(record, value);
                              }}
                              key={record.id}
                            />
                          </div>
                        );
                      }}
                      source="select"
                      sortable={false}
                    />
                    <FunctionField
                      source="name"
                      render={record => {
                        return (
                          <a
                            style={linkStyle}
                            onClick={() => {
                              set_params("sensors", []);
                              set_params("multiple", false);
                              set_params("sensor", record);
                            }}
                            href="#/sensor_chart"
                          >
                            {record.name}
                          </a>
                        );
                      }}
                    />
                    <TextField source="hid" label="HID" />
                    <FunctionField
                      headerStyle={{ textAlign: "center" }}
                      source="is_down"
                      label="status"
                      render={props => {
                        let is_down = props.is_down ? red500 : green500;
                        return (
                          <div
                            style={{ textAlign: "center", minWidth: "100%" }}
                          >
                            <ActionLightbulbOutline color={is_down} />
                          </div>
                        );
                      }}
                    />
                    <FunctionField
                      render={record => {
                        return (
                          <a
                            onClick={() => {
                              set_params("sensor_type", {
                                type: record.type
                              });
                            }}
                            href={`#/company_sensors_by_type`}
                            style={linkStyle}
                          >
                            {record.type}
                          </a>
                        );
                      }}
                      source="type"
                    />
                    <FunctionField
                      label="Dashboard"
                      sortable={false}
                      render={record => {
                        if (this.state.select_dashboard_loading) {
                          return <CircularProgress thickness={2} />;
                        } else {
                          return (
                            <a
                              onClick={() => {
                                if (this.state.select_dashboard_loading) {
                                  return;
                                } else {
                                  this.setState(
                                    {
                                      ...this.state,
                                      dashboard_sensor: record,
                                      select_dashboard_loading: true
                                    },
                                    async () => {
                                      await this.load_dashboards();
                                    }
                                  );
                                }
                              }}
                              style={linkStyle}
                            >
                              Quick view
                            </a>
                          );
                        }
                      }}
                    />
                    <FunctionField
                      source="last_update"
                      render={({ id, last_update, type }) => {
                        let d;
                        if (!last_update) {
                          d = "never";
                        } else {
                          d = moments_ago(new Date(last_update));
                        }
                        return d;
                      }}
                    />

                    {editItems && (
                      <EditButton
                        onClick={record => set_params("sensor", record)}
                      />
                    )}
                  </Datagrid>
                }
              />
            );
          }}
        </List>
        <Dialog
          open={this.state.open_network_assign}
          onRequestClose={bool => {
            if (!this.props.nid || !this.state.removing_sensors) {
              this.setState({ ...this.state, open_network_assign: bool });
            }
          }}
        >
          {!this.props.nid && (
            <NetworkSelect assign_network={nid => this.assign_network(nid)} />
          )}
          {this.props.nid && this.state.removing_sensors && <LinearProgress />}
        </Dialog>
        <Dialog
          open={this.state.showCompareSensors}
          onRequestClose={bool => {
            this.setState({ ...this.state, showCompareSensors: bool });
          }}
        >
          <SelectField
            value={this.state.selected_params}
            onChange={(e, k, p) => {
              this.setState({ ...this.state, selected_params: p });
            }}
            multiple={true}
          >
            {this.make_params().map((val, i) => {
              return <MenuItem value={val} primaryText={val} key={i} />;
            })}
          </SelectField>
          <br />
          <FlatButton
            label="Compare"
            onClick={() => {
              this.compare_sensors();
            }}
          />
        </Dialog>
        <Dialog
          title="Select dashboard"
          modal={true}
          actions={[
            <FlatButton
              label="Cancel"
              disabled={this.state.select_dashboard_loading}
              primary={true}
              onClick={() => {
                this.setState({ ...this.state, select_dashboard: false });
              }}
            />,
            <FlatButton
              primary={true}
              disabled={!this.state.selected_dashboard}
              label="Open"
              onClick={() => {
                this.goto_selected_dashboard();
              }}
            />
          ]}
          open={this.state.select_dashboard}
          onRequestClose={bool => {
            this.setState({ ...this.state, select_dashboard: bool });
          }}
        >
          {this.state.select_dashboard_loading && (
            <CircularProgress thickness={2} />
          )}
          {!this.state.select_dashboard_loading && (
            <SelectField
              value={this.state.selected_dashboard}
              onChange={(e, k, p) => {
                this.setState({ ...this.state, selected_dashboard: p });
              }}
            >
              {this.state.dashboards.map((val, i) => {
                return (
                  <MenuItem
                    value={val.id}
                    primaryText={val.data.name}
                    key={i}
                  />
                );
              })}
            </SelectField>
          )}
          <br />
        </Dialog>
      </div>
    );
  }
}
SensorsList.contextTypes = {
  router: PropTypes.object
};
SensorsList = connect()(SensorsList);
export default props => (
  <InjectParams
    resolve={resolveIfCompany}
    OnFailResolve={<Forwarder to="/" message="No company selected!" />}
  >
    <SensorsList {...props} />
  </InjectParams>
);
