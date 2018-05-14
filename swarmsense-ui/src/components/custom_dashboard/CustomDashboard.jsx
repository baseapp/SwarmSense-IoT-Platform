/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
 
import React from "react";
import MenuItem from "material-ui/MenuItem";
import LinearProgress from "material-ui/LinearProgress";
import random from "lodash.random";
import PropTypes from "prop-types";
import lodash_max from "lodash.max";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import Widget from "../WidgetCustomDashboard";
import { Dashboard } from "../dashboard";
import { get_logger } from "../../utils";
import { Forwarder } from "../index.js";
import {
  getCustomDashboard,
  getWidgets,
  addWidget as _addWidget,
  getSensorInfo,
  deleteWidget as _removeWidget,
  updateWidget as _saveWidget,
  getAllSensorTypes,
  getSensorHistory,
  updateDashboard,
  setSensorConfiguration,
  rest_client as restClient
} from "../../rest";
const ReactGridLayout = WidthProvider(Responsive);

/**
 * Makes a user dashboard or custom dashboard.
 * @extends React.Component
 */

class CustomDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: "",
      dashboard_title: "...",
      dashboard_type: undefined,
      sensor_type_id: undefined,
      widgets: [],
      widgets_backup: [],
      sensor_types: [],
      loading: false,
      widgets_mode: {},
      mqtt_clients: [],
      sensors: [],
      layouts: {}, // layouts prop for the React grid layout (responsive),
      dashboard_edit_mode: false
    };
    this.logger = get_logger("CustomDashboard");
    this.mqtt_clients = [];
    this.re_render = this.re_render.bind(this);
    window.addEventListener("resize", this.re_render);
    // this.id_marker_start = 0;
  }

  /**
   * re_render - When the window size changes, puts the app in loading mode for 2 seconds.
   */

  re_render() {
    if (this.state.loading || window.application.drawer_menu_enabled) {
      return;
    } else {
      this.setState({ ...this.state, loading: true }, () => {
        setTimeout(() => {
          this.setState({ ...this.state, loading: false });
        }, "2000");
      });
    }
  }

  /**
   * componentWillUnmount - Stops the mqtt-updates and removes the "resize" event listener
   *
   */

  componentWillUnmount() {
    this.stopLiveUpdates();
    window.removeEventListener("resize", this.re_render);
  }

  /**
   * setConfigValue - A setter for changing sensor configuration
   *
   * @param  {string} sensor_id    Id of the sensor
   * @param  {string} config_name  Key name of the configuration
   * @param  {string} config_value Value for the newer configuration.
   * @return {Promise} calls a api-wrapper to set the configuration in the backend.
   */

  setConfigValue(sensor_id, config_name, config_value) {
    return setSensorConfiguration({
      sensor_id,
      key: config_name,
      value: config_value
    });
  }

  /**
   * make_layouts - Layout object is responsible for the react-grid-layout to maintain
   * the layout of the widgets in user dashboard. This function helps in constructing that
   * layout object, if the layout is not set already.
   *
   * @param  {Array} widgets The array of object with widget information.
   * @return {Object} the layout object to be used with react-grid-layout.
   */

  make_layouts(widgets) {
    let layouts = { lg: [], md: [], sm: [], xs: [], xxs: [] },
      x = 0,
      y = 0,
      w = 2,
      h = 2;
    widgets.map(({ id }) => {
      layouts.lg.push({ i: id, x, y, w, h });
      x += w;
      if (x >= 12) {
        y += h;
        x = 0;
      }
      return null;
    });
    x = 0;
    y = 0;
    w = 2;
    widgets.map(({ id }) => {
      layouts.md.push({ i: id, x, y, w, h });
      x += w;
      if (x >= 10) {
        y += h;
        x = 0;
      }
      return null;
    });
    x = 0;
    y = 0;
    w = 3;
    h = 2;
    widgets.map(({ id }) => {
      layouts.sm.push({ i: id, x, y, w, h });
      x += w;
      if (x >= 6) {
        y += h;
        x = 0;
      }
      return null;
    });
    x = 0;
    y = 0;
    w = 2;
    h = 2;
    widgets.map(({ id }) => {
      layouts.xs.push({ i: id, x, y, w, h });
      x += w;
      if (x >= 4) {
        y += h;
        x = 0;
      }
      return null;
    });
    x = 0;
    y = 0;
    w = 2;
    h = 2;
    widgets.map(({ id }) => {
      layouts.xxs.push({ i: id, x, y, w, h });
      x += w;
      if (x >= 2) {
        y += h;
        x = 0;
      }
      return null;
    });
    this.logger("@make_layouts, layouts", layouts);
    return layouts;
  }

  /**
   * startLiveUpdates - Starts the mqtt subscription for the sensor-updated values.
   *
   * @param  {string} sensor_id unique id of the sensor
   * @param  {string} filter    filter for messages
   */

  startLiveUpdates(sensor_id, filter) {
    // this.logger("@startLiveUpdates", sensor_id, filter, this.state.sensors);
    let mqtt_clients = this.mqtt_clients;
    if (
      mqtt_clients.some(({ sensor_id: _sid, filter: _fil }) => {
        if (_sid === sensor_id && _fil === filter) {
          // check if the connection is already there.
          return true;
        } else {
          return false;
        }
      })
    ) {
      return;
    }
    // this.logger("@startLiveUpdates", "...starting");
    let subscribe_options = {
      filter: `sensors/${sensor_id}/${filter}`, // define filter based on filter argument - one of "configuration" or "value"
      qos: 2
    };
    let sensors = this.state.sensors.filter(
        ({ info: { id } }) => id === sensor_id
      ), // get all the sensors and extract current-sensor
      current_sensor = sensors.length === 1 ? sensors[0] : undefined; // extracted current sensor
    let client_options = {
      // ipaddr: "45.79.8.213",
      // port: 15675,
      // endpoint: "/ws",
      clientId: `${sensor_id}_${filter}_${random(-1000, 1000)}`, // can be same over many clients. !important
      onMessageArrived: mesg => {
        // basically update the current_sensor.live_updates.config || current_sensor.live_updates.value
        let { live_updates: { config, value } } = current_sensor, // extract "config" and "param" properties. config stores all the configuration values. param stores all the values of sensor-field.
          message = JSON.parse(mesg.payloadString); // parse the message arrived.
        if (filter === "configuration") {
          config = message;
        } else {
          value = value.slice();
          value.unshift(message); // push the message arrived to the start of the value array
          if (value.length >= 10) {
            value = value.slice(0, 10); // store only 10 members in the value array
          }
        }
        current_sensor = {
          ...current_sensor,
          live_updates: {
            value,
            config
          }
        }; // assign back the newly formed current sensor, updated using the message arrived.
        sensors = this.state.sensors.slice(); // extract sensors from the state
        sensors = sensors.map(_sensor => {
          if (_sensor.info.id === sensor_id) {
            // search for the current sensor
            return current_sensor;
          } else {
            return _sensor;
          }
        }); // assign the updated curent sensor to the sensors
        this.setState({ ...this.state, sensors }); // update the state.
      },
      comments: `s-id:${sensor_id}`
    };
    let connect_options = {
      timeout: 40, // safe side.
      userName: `sensor_${sensor_id}`,
      password: `${current_sensor.info.key}`
    };
    try {
      let client = window.mqtt_subscribe(
        client_options,
        connect_options,
        subscribe_options
      );
      mqtt_clients.push({ sensor_id, filter, client });
      // this.setState({ ...this.state, mqtt_clients });
    } catch (e) {
      this.logger("Error occurred while mqtt connect", e.message);
    }
  }

  /**
   * stopLiveUpdates - stops the mqtt-subscription for a sensor or all the possible connections,
   * if sensor-id is not given.
   *
   * @param  {string} sensor_id = null Unique id of the sensor
   * @param  {string} filter = null    filter for messages
   */

  stopLiveUpdates(sensor_id = null, filter = null) {
    // this.logger("@stopLiveUpdates", "stopping ...", this.mqtt_clients);
    let mqtt_clients = this.mqtt_clients,
      sensor_id_provided = sensor_id,
      filter_provided = filter,
      clients = mqtt_clients
        .map(({ sensor_id: _sid, filter: _fil, client }) => {
          if (!filter_provided) {
            filter = _fil; // if no filter is given then extract all the clients with sensor id
          }
          if (!sensor_id_provided) {
            // if no sensor is given then extract all the clients
            sensor_id = _sid;
            filter = _fil;
          }
          // this.logger(
          //   "@stopLiveUpdates: sensor_id, filter, _sid, _fil",
          //   sensor_id,
          //   filter,
          //   _sid,
          //   _fil
          // );
          if (sensor_id === _sid && filter === _fil) {
            // this.logger(
            //   "@stopLiveUpdates: sensor_id, filter",
            //   sensor_id,
            //   filter
            // );
            try {
              if (filter) {
                client.unsubscribe(`sensors/${sensor_id}/${filter}`); // if the filter("values" or "configuration") is given then unsubscribe first.
              }
              client.disconnect(); // then disconnect.
              return undefined;
            } catch (e) {
              // log the error. silently.
              this.logger("@stopLiveUpdate:disconnect error", e.message);
              return undefined;
            }
          } else {
            // this.logger("@stopLiveUpdates: _sid, _fil", _sid, _fil);
            return { _sid, _fil, client };
          }
        })
        .filter(_w => _w);
    this.mqtt_clients = clients;
    // this.logger("@stopLiveUpdates", "stopping ...", this.mqtt_clients);
  }

  /**
   * componentDidMount - loads the current dashboard's data and widgets.
   *
   */

  componentDidMount() {
    let { dashboard_id, company_id: cid, sensor_id } = this.props;
    // this.logger("@cdm", "dashboard_id", dashboard_id, "cid", cid);
    if (dashboard_id && cid) {
      this.setState({ ...this.state, loading: true }, async () => {
        try {
          if (sensor_id) {
            // for sensor id
            let {
              data: { name: dashboard_title, layouts },
              dashboard_type,
              sensor_type: sensor_type_id
            } = await getCustomDashboard({
              cid,
              dashboard_id
            });
            let { data: { type: sensor_type } } = await restClient(
              "GET_ONE",
              "sensor_types",
              { id: sensor_type_id }
            );
            try {
              let info = await getSensorInfo({
                cid,
                sid: sensor_id
              });
              if (info.type === sensor_type) {
                let sensor_info = {},
                  live_updates = { config: {}, value: [] },
                  history = await getSensorHistory({
                    page: 1,
                    cid,
                    sid: sensor_id,
                    perPage: 5
                  });
                // this.logger("@cdm-history", history);
                live_updates.value = [
                  ...history.data,
                  { ...info.value, time: info.last_update }
                ];
                live_updates.config = {
                  ...info.config,
                  time: info.last_update
                };
                sensor_info = { info, live_updates };
                let { data: _widgets = [] } = await getWidgets({
                  dashboard_id,
                  cid,
                  perPage: 200
                });
                let sensor_types = await getAllSensorTypes();
                let widgets = _widgets
                  .filter(widget => widget.data)
                  .map(({ data: widget, id }) => {
                    let new_widget = { ...widget, id };
                    return new_widget;
                  });
                if (!layouts) {
                  layouts = this.make_layouts(widgets);
                }
                this.setState(
                  {
                    ...this.state,
                    sensors: [sensor_info],
                    widgets,
                    widgets_backup: widgets,
                    loading: false,
                    dashboard_title,
                    dashboard_type,
                    sensor_type,
                    sensor_type_id,
                    sensor_types,
                    layouts
                  },
                  () => {
                    this.state.widgets.map(({ type }) => {
                      if (type === "slider" || type === "toggle") {
                        this.startLiveUpdates(sensor_id, "configuration");
                      } else {
                        this.startLiveUpdates(sensor_id, "values");
                      }
                      return null;
                    });
                  }
                );
              } else {
                this.setState({
                  ...this.state,
                  errors: "Wrong type of sensor!"
                });
              }
            } catch (e) {
              throw e;
            }
          } else {
            let { data: _widgets = [] } = await getWidgets({
              dashboard_id,
              cid,
              perPage: 200
            });
            let widgets = _widgets
              .filter(widget => widget.data)
              .map(({ data: widget, id }) => {
                let new_widget = { ...widget, id };
                return new_widget;
              });
            let sensors = new Set(
              widgets.map(({ data_source: { sensor_id } }) => {
                return sensor_id;
              })
            );
            sensors = [...sensors].filter(w => w); //filtering out undefined/boolean false
            // this.logger("@sensors", sensors);
            sensors = await Promise.all(
              sensors.map(async sensor_id => {
                try {
                  let info = await getSensorInfo({
                      cid,
                      sid: sensor_id
                    }),
                    sensor_info = {},
                    live_updates = { config: {}, value: [] },
                    history = await getSensorHistory({
                      page: 1,
                      cid,
                      sid: sensor_id,
                      perPage: 5
                    });
                  // this.logger("@cdm-history", history);
                  live_updates.value = [
                    ...history.data,
                    { ...info.value, time: info.last_update }
                  ];
                  live_updates.config = {
                    ...info.config,
                    time: info.last_update
                  };
                  sensor_info = { info, live_updates };
                  return sensor_info;
                } catch (e) {
                  throw e;
                }
              })
            );
            // this.logger("@cdm-post sensor_inf_history", sensors);
            let sensor_types = await getAllSensorTypes();

            let {
              data: {
                type: dashboard_type = "general",
                name: dashboard_title = "My Dashbaord",
                layouts = this.make_layouts(widgets)
              }
            } = await getCustomDashboard({
              cid,
              dashboard_id
            });
            this.setState(
              {
                ...this.state,
                sensors,
                sensor_types,
                widgets,
                widgets_backup: widgets,
                loading: false,
                dashboard_title,
                dashboard_type,
                layouts
              },
              () => {
                // this.logger(
                //   "@post-cdm",
                //   this.state.sensors,
                //   this.state.widgets
                // );
                // starting live updates.
                this.state.widgets
                  .filter(({ data_source: { sensor_id } }) => sensor_id)
                  .map(({ data_source: { sensor_id }, type }) => {
                    return { sensor_id, type };
                  })
                  .map(({ sensor_id, type }) => {
                    if (type === "slider" || type === "toggle") {
                      this.startLiveUpdates(sensor_id, "configuration");
                    } else {
                      this.startLiveUpdates(sensor_id, "values");
                    }
                    return null;
                  });
              }
            );
          }
        } catch (e) {
          // throw e;
          this.logger("Error occured", e.message);
          this.setState({
            ...this.state,
            error: e.message || e,
            loading: false
          });
        }
      });
    }
  }

  /**
   * getHistoryOf - Requests the history data of a sensor from the endpoint.
   *
   * @param  {strign} sensor_id unique id of the sensor
   * @param  {string} parameter interested field of the sensor reading
   * @param  {Number} days  number of days to query history readings.
   * @return {Promise}
   */

  getHistoryOf(sensor_id, parameter, days) {
    // get the values of a parameter for past days
    let { company_id: cid } = this.props;
    if (!sensor_id) {
      return Promise.reject("No sensor id defined!");
    } else if (!parameter) {
      return Promise.reject("No parameter found");
    } else {
      let duration = undefined;
      if (days) {
        duration = days * 24 * 60 * 60 * 1000;
      } else {
        duration = undefined;
      }
      // this.logger(
      //   "@getHistoryOf: sensor_id, parameter, days, duration",
      //   sensor_id,
      //   parameter,
      //   days,
      //   duration
      // );
      let _req_ob = {
        cid,
        sid: sensor_id
      };
      if (duration) {
        _req_ob.duration = duration;
      } else {
        _req_ob.page = 1;
        _req_ob.perPage = 10;
      }
      return getSensorHistory(_req_ob).then(({ data }) => {
        if (
          data.length >= 1 &&
          !data.every(record => {
            return (
              record[parameter] ||
              record[`mean_${parameter}`] ||
              record[parameter] === null ||
              record[`mean_${parameter}`] === null ||
              record[parameter] === 0 ||
              record[`mean_${parameter}`] === 0
            );
          })
        ) {
          return Promise.reject("Field not found in the data.");
        } else {
          let history = data.map(record => {
            let new_record = { x: Date.parse(record.time) };
            new_record.y = record[parameter] || record[`mean_${parameter}`];
            return new_record;
          });
          // history = history.sort((a, b) => {
          //   return a.x - b.x;
          // });
          return history;
        }
      });
    }
  }

  /**
   * getWidgetTemplate - Makes a template to represent widget initially.
   *
   * @return {Object} The object returned represent one widgent
   */

  getWidgetTemplate() {
    // let random_id = ++this.id_marker_start;
    return {
      // id: random_id,
      type: "text",
      title: "",
      sub_title: "",
      data_source: {
        param_name: "",
        config_name: "",
        param_unit: "",
        min_value: 0,
        max_value: 100
      },
      text_widget_options: {
        label_true: "",
        label_false: ""
      },
      custom_widget_options: {
        fbody: ""
      },
      map_options: {
        latitude_param: "",
        longitude_param: ""
      }
    };
  }

  /**
   * isSensorChanged - Checks if the sensor selected in a widget has changed or not.
   *
   * @param  {Object} new_widget the object representing newer-widget
   * @param  {Object} old_widget the object representing old-widget
   * @return {boolean} true if, sensor has been changed.
   */

  isSensorChanged(new_widget, old_widget) {
    let new_has_sensor_id = false,
      old_has_sensor_id = false;
    if (new_widget["data_source"] && new_widget["data_source"]["sensor_id"]) {
      new_has_sensor_id = true;
    }
    if (old_widget["data_source"] && old_widget["data_source"]["sensor_id"]) {
      old_has_sensor_id = true;
    }
    if (new_has_sensor_id) {
      if (old_has_sensor_id) {
        if (
          new_widget.data_source.sensor_id === old_widget.data_source.sensor_id
        ) {
          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  /**
   * add_layout - adds layout object to the widget object of given widget id.
   *
   * @param  {string} widget_id unique id representing widget.
   */

  add_layout(widget_id) {
    let layouts = { ...this.state.layouts },
      x,
      y,
      w = 2,
      h = 2;
    x = Number.parseInt(lodash_max(layouts.lg.map(({ x }) => x)), 10) + w || 0;
    y = Number.parseInt(lodash_max(layouts.lg.map(({ y }) => y)), 10) + h || 0;
    x = x >= 12 ? 0 : x;
    layouts.lg.push({ i: widget_id, x, y, w, h });

    w = 2;
    x = Number.parseInt(lodash_max(layouts.md.map(({ x }) => x)), 10) + w || 0;
    y = Number.parseInt(lodash_max(layouts.md.map(({ y }) => y)), 10) + h || 0;
    x = x >= 10 ? 0 : x;
    layouts.md.push({ i: widget_id, x, y, w, h });

    w = 3;
    h = 2;
    x = Number.parseInt(lodash_max(layouts.sm.map(({ x }) => x)), 10) + w || 0;
    y = Number.parseInt(lodash_max(layouts.sm.map(({ y }) => y)), 10) + h || 0;
    x = x >= 6 ? 0 : x;
    layouts.sm.push({ i: widget_id, x, y, w, h });

    w = 2;
    h = 2;
    x = Number.parseInt(lodash_max(layouts.xs.map(({ x }) => x)), 10) + w || 0;
    y = Number.parseInt(lodash_max(layouts.xs.map(({ y }) => y)), 10) + h || 0;
    x = x >= 4 ? 0 : x;
    layouts.xs.push({ i: widget_id, x, y, w, h });

    w = 2;
    h = 2;
    x = Number.parseInt(lodash_max(layouts.xxs.map(({ x }) => x)), 10) + w || 0;
    y = Number.parseInt(lodash_max(layouts.xxs.map(({ y }) => y)), 10) + h || 0;
    x = x >= 2 ? 0 : x;
    layouts.xxs.push({ i: widget_id, x, y, w, h });

    return layouts;
  }

  /**
   * remove_layout - remove layout object from the widget object of the given widget id
   *
   * @param  {string} widget_id unique id representing widget
   */

  remove_layout(widget_id) {
    let layouts = { ...this.state.layouts };
    Object.getOwnPropertyNames(layouts).map(break_point => {
      layouts[break_point] = layouts[break_point].filter(
        ({ i: _widget_id }) => _widget_id !== widget_id
      );
      return null;
    });
    return layouts;
  }

  /**
   * addWidget - Adds a new widget object to the state.widgets
   *
   */

  addWidget() {
    // this.logger("@addWidget called", this.state.widgets.length);
    this.setState({ ...this.state, loading: true }, async () => {
      try {
        let widgets = this.state.widgets.slice(),
          widgets_backup = this.state.widgets_backup.slice(),
          new_widget = this.getWidgetTemplate(),
          { company_id: cid, dashboard_id } = this.props;
        let { data: { id } } = await _addWidget({
          cid,
          dashboard_id,
          data: { data: new_widget }
        });
        new_widget.id = id;
        widgets.push(new_widget);
        widgets_backup.push(new_widget);
        this.setState({
          ...this.state,
          layouts: this.add_layout(id),
          widgets,
          widgets_backup,
          loading: false
        });
      } catch (e) {
        console.log(e);
        this.setState({ ...this.state, loading: false, error: e.message || e });
      }
    });
  }

  /**
   * setToConfigure - sets a widget's mode to edit.
   *
   * @param  {string} widget_id unique widget id of the widget
   */

  setToConfigure(widget_id) {
    let widgets_mode = this.state.widgets_mode;
    widgets_mode[`${widget_id}`] = "edit";
    this.setState({ ...this.state, widgets_mode });
  }

  /**
   * saveWidget - Saves a widget information to the backend.
   *
   * @param  {string} widget_id unique id for the widget
   */

  saveWidget(widget_id) {
    this.logger("@save widget");
    this.setState({ ...this.state, loading: true }, async () => {
      try {
        let { dashboard_id, company_id: cid } = this.props,
          widget_to_be_saved = this.state.widgets.filter(
            widget => widget.id === widget_id
          )[0];
        await _saveWidget({
          cid,
          dashboard_id,
          widget_id,
          data: widget_to_be_saved
        });
        let widgets_backup = this.state.widgets_backup.map(_widget => {
            if (_widget.id === widget_id) {
              return widget_to_be_saved;
            } else {
              return _widget;
            }
          }),
          widgets_mode = this.state.widgets_mode;
        widgets_mode[`${widget_id}`] = "view";
        this.setState({
          ...this.state,
          widgets_backup,
          widgets_mode,
          loading: false
        }); //save widget
      } catch (e) {
        this.setState({ ...this.state, error: e.message || e, loading: false });
      }
    });
  }

  /**
   * changeWidget - It modifies a widget's data stored in the state.
   *
   * @param  {Object} widget the changed widget to be stored.
   */

  changeWidget(widget) {
    // this.logger("@change widget", widget);
    let sensors = this.state.sensors.slice();
    let widgets = this.state.widgets.map(_widget => {
      //search for widget
      if (_widget.id === widget.id) {
        // if the widget is found
        if (this.isSensorChanged(widget, _widget)) {
          // the sensor is changed.
          if (
            !sensors.some(_sensor => {
              // search through the current sensor's registry
              if (_sensor.info.id === widget.data_source.sensor_id) {
                // if found
                return true;
              } else {
                return false;
              }
            })
          ) {
            let last_update = widget.data_source.sensor.last_update;
            sensors.push({
              info: widget.data_source.sensor,
              live_updates: {
                value: [
                  { ...widget.data_source.sensor.value, time: last_update }
                ],
                config: {
                  ...widget.data_source.sensor.config,
                  time: last_update
                }
              }
            });
          }
          delete widget["data_source"]["sensor"];
        }
        return widget;
      } else {
        return _widget;
      }
    });
    this.setState({ ...this.state, widgets, sensors }, () => {
      // this.logger("@change widget sensors", this.state.sensors);
    });
  }

  /**
   * removeWidget - Removes a widget from the state and backend.
   *
   * @param  {string} widget_id unique id of a widget
   */

  removeWidget(widget_id) {
    // TODO : On Layout change remove a particulat layout.
    this.logger("@remove widget");
    this.setState({ ...this.state, loading: true }, async () => {
      try {
        let { dashboard_id, company_id: cid } = this.props;
        await _removeWidget({ cid, dashboard_id, widget_id });
        let widgets = this.state.widgets.filter(_widget => {
            if (_widget.id === widget_id) {
              return false;
            } else {
              return true;
            }
          }),
          widgets_backup = this.state.widgets_backup.filter(_widget => {
            if (_widget.id === widget_id) {
              return false;
            } else {
              return true;
            }
          });
        this.setState({
          ...this.state,
          widgets,
          widgets_backup,
          loading: false
        });
      } catch (e) {
        this.setState({ ...this.state, loading: false, error: e.message || e });
      }
    });
  }

  /**
   * cancelSaveWidget - Cancels the current editing of widget and restores the
   * backed up widget data to the widget.
   *
   * @param  {string} widget_id widget id
   */

  cancelSaveWidget(widget_id) {
    this.logger("@cancel save widget");
    let widget_to_unsave = this.state.widgets_backup.filter(
        widget => widget.id === widget_id
      )[0],
      widgets = this.state.widgets.map(_widget => {
        if (_widget.id === widget_id) {
          return widget_to_unsave;
        } else {
          return _widget;
        }
      });
    let widgets_mode = this.state.widgets_mode;
    widgets_mode[`${widget_id}`] = "view";
    this.setState({ ...this.state, widgets, widgets_mode }); //unsave widget
  }

  /**
   * render_widgets - returns proper view when rendering widgets.
   *
   * @return {React.Node} Node representing the current view
   */

  render_widgets() {
    if (this.state.loading) {
      return <LinearProgress />;
    } else if (this.state.error) {
      //improvise
      return <Forwarder to="/my_dashboards" message={this.state.error} />;
    } else {
      let if_any_widget_is_configuring = Object.getOwnPropertyNames(
        this.state.widgets_mode
      ).some(widget_id => this.state.widgets_mode[widget_id] === "edit");
      return (
        <ReactGridLayout
          measureBeforeMount={true}
          isDraggable={
            this.state.dashboard_edit_mode && !if_any_widget_is_configuring
          }
          isResizable={this.state.dashboard_edit_mode}
          className="layout"
          layouts={this.state.layouts}
          containerPadding={[10, 10]}
          margin={[5, 5]}
          onLayoutChange={(currentLayout, layouts) => {
            // this.logger("@layoutchange", currentLayout, layouts);
            this.setState({ ...this.state, layouts });
          }}
          onBreakpointChange={(newBreakpoint, newCols) => {
            // this.logger(
            //   "@onBreakpointChange, newBreakpoint, newCols",
            //   newBreakpoint,
            //   newCols
            // );
          }}
          onWidthChange={(containerWidth, margin, cols, containerPadding) => {
            // this.logger(
            //   "@onWidthChange, containerWidth, margin, cols, containerPadding",
            //   containerWidth,
            //   margin,
            //   cols,
            //   containerPadding
            // );
          }}
        >
          {this.state.widgets
            .filter(widget => widget) // EXPLORE: Chrome bug !
            .sort((wa, wb) => {
              let oa = Number.parseInt(wa.order, 10) || 100,
                ob = Number.parseInt(wa.order, 10) || 100;
              return oa - ob;
            })
            .map((widget, key) => {
              let sensor = [];
              if (this.props.sensor_id) {
                sensor = this.state.sensors;
              } else {
                sensor = this.state.sensors.filter(
                  ({ info: { id } }) => id === widget.data_source.sensor_id
                );
              }
              // this.logger(
              //   "@render_widgets",
              //   widget.id,
              //   sensor,
              //   this.state.sensors
              // );
              if (sensor.length === 1) {
                sensor = sensor[0];
              } else {
                sensor = {};
              }
              let mode = this.state.dashboard_edit_mode
                ? this.state.widgets_mode[widget.id]
                  ? this.state.widgets_mode[widget.id]
                  : "view"
                : "view";
              let _widget = (
                <div key={widget.id.toString()}>
                  <Widget
                    setConfigValue={(config, value) =>
                      this.setConfigValue(sensor["info"]["id"], config, value)
                    }
                    dashboardType={this.state.dashboard_type}
                    widget={{ ...widget }}
                    showMenu={this.state.dashboard_edit_mode}
                    mode={mode}
                    onConfigure={() => this.setToConfigure(widget.id)}
                    onCancelSave={() => this.cancelSaveWidget(widget.id)}
                    onSave={() => this.saveWidget(widget.id)}
                    onChangeWidget={widget => this.changeWidget(widget)}
                    onRemoveWidget={() => this.removeWidget(widget.id)}
                    sensorTypes={this.state.sensor_types}
                    sensor={sensor}
                    getHistoryOf={days =>
                      this.getHistoryOf(
                        sensor["info"]["id"] || null,
                        widget.data_source.param_name || null,
                        days
                      )
                    }
                    cid={this.props.company_id}
                  />
                </div>
              );
              return _widget;
            })}
        </ReactGridLayout>
      );
    }
  }
  render() {
    let { dashboard_id } = this.props,
      readOnly =
        sessionStorage.getItem("company_role") === "read" ? true : false;
    if (this.state.error) {
      return <div>{this.state.error}</div>;
    }
    return (
      <Dashboard
        menuItems={[
          <MenuItem
            disabled={readOnly}
            primaryText={this.state.dashboard_edit_mode ? "Save" : "Edit"}
            onClick={() => {
              this.setState(
                {
                  ...this.state,
                  dashboard_edit_mode: !this.state.dashboard_edit_mode
                },
                () => {
                  if (this.state.dashboard_edit_mode) {
                    this.stopLiveUpdates();
                  } else {
                    this.setState(
                      { ...this.state, loading: true },
                      async () => {
                        try {
                          // save the dashboard with layout.
                          let { company_id: cid } = this.props,
                            {
                              dashboard_title: name,
                              layouts,
                              sensor_type_id,
                              dashboard_type
                            } = this.state,
                            data = {
                              data: { name, layouts },
                              sensor_type: sensor_type_id,
                              dashboard_type
                            };
                          await updateDashboard({
                            cid,
                            dashboard_id,
                            data
                          });
                        } catch (e) {
                          this.logger("@save dashboard error", e.message);
                        } finally {
                          this.setState(
                            { ...this.state, loading: false },
                            () => {
                              this.state.widgets
                                .filter(
                                  ({ data_source: { sensor_id } }) =>
                                    this.props.sensor_id ? true : sensor_id
                                )
                                .map(
                                  ({
                                    data_source: { sensor_id: _sid },
                                    type
                                  }) => {
                                    let sensor_id = this.props.sensor_id
                                      ? this.props.sensor_id
                                      : _sid;
                                    return { sensor_id, type };
                                  }
                                )
                                .map(({ sensor_id, type }) => {
                                  if (type === "slider" || type === "toggle") {
                                    this.startLiveUpdates(
                                      sensor_id,
                                      "configuration"
                                    );
                                  } else {
                                    this.startLiveUpdates(sensor_id, "values");
                                  }
                                  return null;
                                });
                            }
                          );
                        }
                      }
                    );
                  }
                }
              );
            }}
          />
        ]}
        id={dashboard_id}
        disableAdding={readOnly}
        onAddWidget={() => (readOnly ? null : this.addWidget())}
        title={this.state.dashboard_title}
      >
        {this.render_widgets()}
      </Dashboard>
    );
  }
}
CustomDashboard.propTypes = {
  company_id: PropTypes.string.isRequired,
  dashboard_id: PropTypes.string.isRequired,
  sensor_id: PropTypes.string
};
export default CustomDashboard;
