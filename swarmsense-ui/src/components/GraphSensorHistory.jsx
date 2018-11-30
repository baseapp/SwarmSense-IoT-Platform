/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import Paper from "material-ui/Paper";
import FlatButton from "material-ui/FlatButton";
import RaisedButton from "material-ui/RaisedButton";
import DatePicker from "material-ui/DatePicker";
import { ViewTitle, showNotification } from "admin-on-rest";
import LinearProgress from "material-ui/LinearProgress";
import { connect } from "react-redux";
import { GridList, GridTile } from "material-ui/GridList";
import { moments_ago } from "../utils";
import { getSensorHistory, getSensorsHistory } from "../rest";
import { GraphArea } from "./index";
import {
  resolveIfSensor,
  resolveIfSensorsAndParams,
  get_logger,
  get_params,
  set_params
} from "../utils";
import Forwarder from "./Forwarder";
import InjectParams from "./InjectParams";
const styles = {
  verticalFlex: {
    display: "flex",
    flexDirection: "column"
  },
  horizontalFlex: {
    display: "flex",
    flexDirection: "row"
  },
  gridContainerNx1: {
    display: "grid",
    gridTemplateRows: "auto",
    gridTemplateColumns: "auto",
    gridAutoFlow: "row"
  },
  root: {
    // width: 500,
    maxWidth: 500,
    position: "fixed",
    bottom: "10px",
    right: "0px",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    zIndex: 100,
    overflow: "auto"
  },
  gridList: {
    width: 500,
    height: 150,
    maxWidth: 500,
    maxHeight: 150,
    overflowY: "auto",
    overflowX: "auto"
  },
  container: {
    textAlign: "right",
    marginRight: "25px"
  }
};

/**
 * Component to show grid of sensor readings.
 * @extends React.Component
 */

class SensorHistory extends React.Component {
  constructor(props) {
    super(props);
    this.update_frequency = 1; // every "update_frequency" number of updates
    let { from_date, to_date } = this.getInitialDates();
    this.state = {
      from_date,
      to_date,
      loading: true,
      layout_columns: 1,
      data: {},
      show_dates: false,
      version: 1,
      redraw_charts: false,
      updates_data: [],
      realtime_allow: false,
      displayUpdates: false,
      style: {display: 'none'},
    };
    this.mqtt_client = null;
    this.logger = get_logger("GraphSensorHistory", true);
  }

  /**
   * getInitialDates - It initializes the date range
   *
   * @param  {boolean} noResetFlag = true If false, then reset the date range for 7 day duration, else, try to set
   * the last date range used.
   * @return {Object} Returns Object.from_date and Object.to_date, representing the date-range.
   */

  getInitialDates(noResetFlag = true) {
    // get the default dates
    const seven_days = 7 * 24 * 60 * 60 * 1000;
    let from_date = new Date(Date.now() - seven_days);
    let to_date = new Date(Date.now());
    if (noResetFlag) {
      let { last_from_date = undefined, last_to_date = undefined } = get_params(
        "graph_sensor_history"
      );
      if (last_from_date) {
        from_date = new Date(last_from_date);
      }
      if (last_to_date) {
        to_date = new Date(last_to_date);
      }
    }
    return { from_date, to_date };
  }

  /**
   * async update_charts - Updates the chart
   *
   * @param  {boolean} fetch = true  Controls if the data is fetched from the server or not.
   * @param  {boolean} redraw_charts = false Controls if the charts are to be redrawn.
   */

  async update_charts(fetch = true, redraw_charts = false) {
    this.props.dispatch(showNotification("updating graphs ..."));
    let data;
    if (fetch) {
      data = await this.getHistory();
    } else {
      data = this.state.data;
    }
    this.setState(
      { ...this.state, data, version: this.state.version + 1, redraw_charts },
      () => {
        this.props.dispatch(showNotification("updated!"));
      }
    );
  }

  /**
   * async getHistory - Fetches history of sensor values from the backend.
   *
   * @return {Promise}  Promise resolving in the data from the server.
   */

  async getHistory() {
    let {
      sensor: { id: sid, created_at },
      global_company: { id: cid }
    } = this.props;
    let { from_date: from, to_date: to } = this.state;
    try {
      if (this.props.multiple && this.props.params) {
        // multiple sensors comparison
        let sids = this.props.sensors.map(_ => {
          return { ..._, cid, sid: _.id, from, to, group_by_fields: true };
        });
        this.logger(sids);
        let params = this.props.params;
        let data = await getSensorsHistory(sids, params);
        this.logger("getSensorsHistory_data", data);
        let _data = {}; // _data.shapeOf({<param>:<ArrayOf<Object.shapeOf({sensor_id, sensor_data: <ArrayOf<Object.shapeOf({time, value})>>, sensor_name})>>})
        this.props.params.map(param => {
          _data[param] = data.map(_ => {
            let sensor_data = _.data[param]
              ? _.data[param].map(d => {
                  let value = d[param];
                  return { time: d.time, value };
                })
              : [];
            return {
              sensor_id: _.sensor_id,
              sensor_data,
              sensor_name: this.props.sensors.filter(
                _sensor => _sensor.id === _.sensor_id
              )[0]["name"]
            };
          });
          return null;
        });
        this.logger("transformed_data", _data);
        return _data;
      } else {
        let page = null,
          perPage = null;
        if (this.state.realtime_allow) {
          page = 1;
          perPage = 30;
        }
        let data = await getSensorHistory({
          cid,
          sid,
          from,
          to,
          page,
          perPage,
          created_at
        });
        data.data = data.data.sort((a, b) => {
          return Date.parse(a.time) - Date.parse(b.time);
        }); //sorting in ascending order required by highcharts.js
        data.fields = Object.getOwnPropertyNames(data.fields)
          .sort((a, b) => {
            let weight_a = data.fields[a]["weight"] || 10;
            let weight_b = data.fields[b]["weight"] || 10;
            return weight_b - weight_a;
          })
          .filter(n => data.fields[n].type !== "file")
          .map(n => {
            let field = { ...data.fields[n], name: n };
            return field;
          });
        return data;
      }
    } catch (err) {
      throw err;
    } finally {
      this.setState({ ...this.state, loading: false });
    }
  }

  /**
   * getColorIterator - Creates the function to produce a new color
   * every time it is called, cicularly rotated when list of colors is finished.
   *
   * @return {function}  Function to be called for getting a new color.
   */

  getColorIterator() {
    // for sequential colouring in the chart
    let colors = [
      "#f15c80",
      "#e4d354",
      "#2b908f",
      "#f45b5b",
      "#91e8e1",
      "#434348",
      "#90ed7d",
      "#f7a35c",
      "#8085e9"
    ];
    let i = 0;
    return (init = false) => {
      if (i >= colors.length || init) {
        i = 0;
      }
      let current_color = colors[i];
      i = i + 1;
      return current_color;
    };
  }

  /**
   * mqtt_connect - Connects to the mqtt backend for real time updates.
   *
   */

  mqtt_connect() {
    if (this.props.multiple) {
      //for multiple sensors do nothing
    } else {
      // for single sensor data_updates
      // console.log(this.props.sid, this.props.skey)
      let { sensor: { id: sid } } = this.props;
      let subscribe_options = {
        filter: `sensors/${sid}/values`,
        qos: 2
      };
      let client_options = {
        // ipaddr: "45.79.8.213",
        // port: 15675,
        // endpoint: "/ws",
        clientId: "asdwasdasd", // gibberish
        onMessageArrived: mesg => {
          let { updates_data } = this.state;
          updates_data.push(mesg);
          let state_data = this.state.data;
          if (state_data.data && updates_data.length >= this.update_frequency) {
            if (this.state.realtime_allow) {
              // only updates the chart, if the state.realtime_allow is true
              let init_id = state_data.data[0].id;
              let updates_data_mesg = updates_data.map(st => {
                let _ob = JSON.parse(st.payloadString);
                _ob.id = init_id + 1;
                init_id += 1;
                return _ob;
              });
              updates_data_mesg = updates_data_mesg.concat(state_data.data);
              updates_data_mesg.sort((a, b) => {
                return Date.parse(a.time) - Date.parse(b.time);
              });
              for (let i = 0; i < updates_data.length; i++) {
                updates_data_mesg.shift(); // removes the data from the start
              }
              let updated_data = { ...state_data, data: updates_data_mesg };
              this.setState(
                { ...this.state, data: updated_data, updates_data },
                () => {
                  this.update_charts(false);
                }
              );
            } else {
              this.setState({ ...this.state, updates_data });
            }
          } else {
            this.setState({ ...this.state, updates_data });
          }
        },
        comments: `s-id:${this.props.sid}`
      };
      let connect_options = {
        timeout: 3,
        userName: `sensor_${this.props.sid}`,
        password: `${this.props.skey}`
      };
      this.mqtt_client = window.mqtt_subscribe(
        client_options,
        connect_options,
        subscribe_options
      );
    }
  }

  /**
   * mqtt_disconnect - Stops receiving updates from the mqtt backend.
   *
   */

  mqtt_disconnect() {
    if (this.props.multiple) {
      // do nothing for multiple sensors.
    } else {
      try {
        let { sensor: { id: sid } } = this.props;
        this.mqtt_client.unsubscribe(`sensors/${sid}/values`);
        this.mqtt_client.disconnect();
      } catch (err) {
        console.log("MQTT:Unsubscribe failed", err);
      }
    }
  }
  componentWillUnmount() {
    // this.mqtt_disconnect() //hiding the feature
  }
  async componentDidMount() {
    // this.mqtt_connect() // hiding the feature
    try {
      let data = await this.getHistory();
      this.logger("componentDidMount data", data);
      this.setState({ ...this.state, data, version: this.state.version + 1 });
    } catch (err) {
      this.props.dispatch(showNotification(err.message, "warning"));
    }
  }
  render() {
    let graphs = [];
    let graphs_options = {};
    if (this.props.multiple && this.props.params) {
      let fields = Object.getOwnPropertyNames(this.state.data);
      this.logger("render fields, this.state.data", fields, this.state.data);
      if (fields.length > 0) {
        graphs = fields.map(field => {
          let getColor = this.getColorIterator();
          let graph_id = field,
            options = {
              title: { text: field },
              series: this.state.data[field]
                ? this.state.data[field].map(s_data => {
                    return {
                      color: getColor(),
                      type: "line",
                      data: s_data["sensor_data"]
                        ? s_data.sensor_data.map(vals => {
                            return { x: Date.parse(vals.time), y: vals.value };
                          })
                        : [],
                      name: `${s_data.sensor_name}`,
                      marker: { enabled: true }
                    };
                  })
                : []
            };
          if (this.state.realtime_allow) {
            options.chart = { zoomType: undefined, onSelection: () => {} };
          }
          return { graph_id, options };
        });
      }
      this.logger("render graphs", graphs);
    } else {
      if (this.state.data["fields"]) {
        let getColor = this.getColorIterator();
        let aggregate = this.state.data.aggregate || {};
        for(var key in aggregate) {
            if(aggregate.hasOwnProperty(key)) {
              if (key.startsWith("mean") || key.startsWith("min") || key.startsWith("max"))
                aggregate[key] = aggregate[key] ? parseFloat(aggregate[key]).toFixed(2) : undefined;
              if (key.startsWith("count"))
                aggregate[key] = aggregate[key] ? parseInt(aggregate[key]) : undefined;
            }
        }
        graphs = this.state.data["fields"].map(f => {
          let min = aggregate[`min_${f.name}`] || '--',
              max = aggregate[`max_${f.name}`] || '--',
              mean = aggregate[`mean_${f.name}`] || '--',
              count = aggregate[`count_${f.name}`] || '--';

          let graph_id = f.title || f.name,
            options = {
              title: {
                text: f.title || f.name
              },
              subtitle: {
                text: `Min: ${min}, Max: ${max}, Mean: ${mean}, Count: ${count}`
              },
              series: [
                {
                  color: getColor(),
                  type: "area",
                  data: this.state.data.data.map(d => {
                    let y;
                    if (!isNaN(d[f.name])) {
                      y = d[f.name];
                    } else if (!isNaN(d[`mean_${f.name}`])) {
                      y = d[`mean_${f.name}`];
                    } else {
                      y = null;
                    }
                    let _ob = { x: Date.parse(d.time), y };
                    // if(d.fromServer){
                    //   _ob.color = "black" //fromServer data point
                    //   _ob.colorIndex = "black" // fromServer data point
                    // }
                    return _ob;
                  }),
                  name: f.title || f.name,
                  marker: { enabled: true }
                }
              ]
            };
          return { options, graph_id };
        });
      }
    }
    let updates_data = this.state.updates_data;
    updates_data.sort((mesg_a, mesg_b) => {
      let _ob_a = JSON.parse(mesg_a.payloadString),
        _ob_b = JSON.parse(mesg_b.payloadString);
      return Date.parse(_ob_b.time) - Date.parse(_ob_a.time);
    });
    return (
      <Paper style={styles.verticalFlex} id="graphs-view">
        <div>
          <div style={styles.horizontalFlex}>
            <div style={{ flexGrow: "2" }}>
              <ViewTitle title={"Sensor History( Graph )"} />
            </div>
            <div>
              <div style={{ float: "right", padding: "15px" }}>
                {/*!this.props.multiple*/ false && (
                  <FlatButton
                    primary
                    label={
                      this.state.realtime_allow
                        ? "Disable realtime"
                        : "Enable realtime"
                    }
                    disabled={this.state.loading ? true : false}
                    onClick={() => {
                      let { to_date, from_date } = this.getInitialDates();
                      if (!this.state.realtime_allow) {
                        to_date = null;
                        from_date = null;
                      }
                      this.setState(
                        {
                          ...this.state,
                          realtime_allow: !this.state.realtime_allow,
                          show_dates: this.state.realtime_allow,
                          to_date,
                          from_date
                        },
                        () => {
                          this.update_charts(true, true);
                        }
                      );
                    }}
                  />
                )}
                {!this.state.realtime_allow && (
                  <FlatButton
                    primary
                    style={{height: '37px'}}
                    labelStyle={{paddingTop: '1px'}}
                    label={
                      this.state.show_dates ? "Hide Filter" : "Show Filter"
                    }
                    onClick={() => {
                      this.setState({
                        ...this.state,
                        show_dates: !this.state.show_dates
                      });
                    }}
                  />
                )}
                <FlatButton
                  primary
                  label="Sensors"
                  onClick={() => null}
                  href="#/company_sensors"
                />
                <FlatButton
                  primary
                  label="Export"
                  href="#/sensor_export"
                  disabled={this.props.multiple}
                />
                <FlatButton
                  primary
                  label="Alerts"
                  href="#/sensor_alerts"
                  disabled={this.props.multiple}
                />
                <FlatButton
                  primary
                  label="Events"
                  href="#/sensor_events"
                  disabled={this.props.multiple}
                />
                <FlatButton
                  primary
                  label="Values"
                  href="#/sensor_history"
                  disabled={this.props.multiple}
                />
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            paddingTop: "0px",
            paddingBottom: "0px",
            marginTop: "0px",
            marginBottom: "0px"
          }}
        >
          <div
            id="range-setter"
            style={{
              padding: "15px",
              float: "right",
              paddingTop: "0px",
              display: this.state.show_dates ? "" : "none"
            }}
          >
            <div style={{ ...styles.horizontalFlex, flexWrap: "wrap" }}>
              <DatePicker
                textFieldStyle={{ width: "150px" }}
                floatingLabelText="From"
                container="inline"
                onChange={(e, d) => {
                  let ob = {
                    last_from_date: d,
                    last_to_date: this.state.to_date
                  };
                  set_params("graph_sensor_history", ob);
                  this.setState({ ...this.state, from_date: d });
                }}
                value={this.state.from_date}
              />{" "}
              &nbsp;
              <DatePicker
                textFieldStyle={{ width: "150px" }}
                floatingLabelText="To"
                container="inline"
                onChange={(e, d) => {
                  let ob = {
                    last_from_date: this.state.from_date,
                    last_to_date: d
                  };
                  set_params("graph_sensor_history", ob);
                  this.setState({ ...this.state, to_date: d });
                }}
                value={this.state.to_date}
              />
            </div>
            <div
              style={{ ...styles.horizontalFlex, justifyContent: "flex-end" }}
            >
              <FlatButton
                label="Reset"
                primary
                onClick={() => {
                  let { from_date, to_date } = this.getInitialDates(false);
                  this.setState(
                    { ...this.state, from_date, to_date, loading: true },
                    () => {
                      this.update_charts(true, true);
                      this.setState({ ...this.state, loading: false });
                    }
                  );
                }}
              />

              <FlatButton
                label="Load"
                primary
                onClick={() => {
                  this.setState({ ...this.state, loading: true }, () => {
                    this.update_charts(true, true);
                    this.setState({ ...this.state, loading: false });
                  });
                }}
              />
            </div>
          </div>
        </div>
        {this.state.loading && <LinearProgress />}
        <div
          id="updates"
          style={{
            ...styles.root,
            display: this.props.multiple ? "none" : "",
            display: "none" //remove display:none to feature realtime updates
          }}
        >
          <div>
            <RaisedButton
              primary
              disabled={this.state.updates_data.length >= 1 ? false : true}
              label={`${this.state.displayUpdates ? "Hide" : "Show"} updates(${
                this.state.updates_data.length
              })`}
              onClick={() => {
                this.setState({
                  ...this.state,
                  displayUpdates: !this.state.displayUpdates
                });
              }}
            />
            <RaisedButton
              label="Clear updates!"
              disabled={this.state.updates_data.length >= 1 ? false : true}
              onClick={() => {
                this.setState({ ...this.state, updates_data: [] });
              }}
            />
          </div>
          <GridList
            cols={1}
            cellHeight={50}
            padding={1}
            style={{
              ...styles.gridList,
              display: this.state.displayUpdates ? "" : "none"
            }}
          >
            {updates_data.map((mesg, i) => {
              let _ob = JSON.parse(mesg.payloadString),
                value_string = Object.getOwnPropertyNames(_ob)
                  .map(field_name => {
                    if (field_name === "time" || field_name === "fromServer") {
                      return null;
                    } else {
                      return `${field_name}:${_ob[field_name]}`;
                    }
                  })
                  .filter(ob => ob)
                  .join(" , "),
                subtitle = `${moments_ago(
                  new Date(_ob["time"])
                )}: ${value_string}`;
              return (
                <GridTile
                  cols={1}
                  rows={1}
                  key={i}
                  title={"sensor_id:" + mesg.destinationName.split("/")[1]}
                  subtitle={subtitle}
                />
              );
            })}
          </GridList>
        </div>
        <div style={styles.container}>
        <RaisedButton
          label="Reset Zoom"
          style={this.state.style}
          primary
          onClick={() => {
            let { from_date, to_date } = this.getInitialDates(false);
            this.setState(
              { ...this.state, from_date, to_date, loading: true },
              () => {
                this.update_charts(true, true);
                this.setState({ ...this.state, loading: false, style: {display: 'none'} });
              }
            );
          }}
        />
        </div>
        <GraphArea
          loading={this.state.loading}
          data_version={this.state.version}
          section_id="graph-container"
          graphs={graphs}
          graphs_options={graphs_options}
          timeSeries={true}
          redraw_charts={this.state.redraw_charts ? true : false}
          show_formatting={false}
          onSelection={(min, max) => {
            // console.log(min, max)
            if (!this.state.realtime_allow) {
              let from_date = new Date(min),
                to_date = new Date(max);
              this.setState({ ...this.state, from_date, to_date, style: {} }, () => {
                this.update_charts(true, true);
              });
            }
          }}
        />
      </Paper>
    );
  }
}
SensorHistory = connect()(SensorHistory);
export default props => (
  <InjectParams
    resolve={params =>
      params["multiple"]
        ? resolveIfSensorsAndParams(params)
        : resolveIfSensor(params)
    }
    OnFailResolve={<Forwarder to="/" message="Select sensor(s) first!!" />}
  >
    <SensorHistory {...props} />
  </InjectParams>
);
