/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import LinearProgress from "material-ui/LinearProgress";
import PropTypes from "prop-types";
import Dialog from "material-ui/Dialog";
import CircularProgress from "material-ui/CircularProgress";
import EditWidget from "./EditWidgetCustomDashboard";
import RaisedButton from "material-ui/RaisedButton";
import Widget from "./WidgetGeneric";
import WidgetText from "./WidgetText";
import WidgetGraph from "./WidgetGraph";
import WidgetGauge from "./WidgetGauge";
import WidgetImage from "./WidgetImage";
import WidgetMap from "./WidgetMap";
import WidgetCustom from "./WidgetCustom";
import WidgetToggle from "./WidgetToggle";
import WidgetSlider from "./WidgetSlider";
import { get_logger } from "../utils";
import { apiUrl } from "../rest";
class WidgetCustomDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      history: []
    };
    this.logger = get_logger("WidgetCustomDashboard");
  }
  onRemoveWidget(id) {
    this.props.onRemoveWidget(id);
  }
  onConfigure() {
    this.props.onConfigure();
  }
  onSave() {
    this.props.onSave();
  }
  onCancelSave() {
    this.props.onCancelSave();
  }
  onChangeWidget(widget) {
    this.props.onChangeWidget(widget);
  }
  render_view() {
    let view = null,
      { mode, widget, showMenu } = this.props;
    const if_rendering_possible = () => {
      let possible = undefined;
      if (!widget.id) {
        possible = false;
      } else if (widget.type === "slider" || widget.type === "toggle") {
        if (widget.data_source.config_name) {
          possible = true;
        } else {
          possible = false;
        }
      } else if (widget.type === "map" && widget.map_options) {
        if (
          (widget.map_options.latitude_param &&
            widget.map_options.longitude_param) ||
          (widget.map_options.latitude && widget.map_options.longitude)
        ) {
          possible = true;
        } else {
          possible = false;
        }
      } else if (widget.data_source.param_name) {
        if (
          widget.type === "custom" &&
          widget.custom_widget_options &&
          widget.custom_widget_options.fbody
        ) {
          possible = true;
        } else {
          possible = true;
        }
      } else {
        possible = false;
      }
      return possible;
    };
    switch (this.props.mode) {
      case "edit": {
        view = <CircularProgress />;
        break;
      }
      case "view": {
        //this.logger("@render_view", this.props.sensor);
        //this.logger("@map_render: map_options", widget.map_options)
        if (!if_rendering_possible()) {
          view = this.props.showMenu ? <div><RaisedButton label="Configure" onClick={() => this.onConfigure()} /></div> : <div>Please configure sensor, first!</div>;
        } else if (
          !this.props.sensor ||
          !this.props.sensor.live_updates ||
          !this.props.sensor.live_updates.value
        ) {
          view = (
            <div>
              No sensor or live-updates found in registry. Contact developer!
            </div>
          );
        } else {
          let current_value = this.props.sensor.live_updates,
            name = widget.data_source["param_name"] || "",
            _value =
              current_value["value"] &&
              current_value["value"][0] &&
              (current_value["value"][0][name] ||
                current_value["value"][0][name] === 0) && // check for zero value
              current_value.value[0][name].toString()
                ? current_value.value[0][name].toString()
                : "", // taking the most recent value. Aware of a zero error.
            unit = widget.data_source["param_unit"] || null,
            time = current_value["value"][0]["time"],
            getHistoryOf = days => {
              // this.logger("@getHistoryOf, days", days);
              return this.props.getHistoryOf(days);
            };
          // this.logger(
          //   "@widget_render:current_value.value & name & current_value.value[name]",
          //   current_value["value"],
          //   name,
          //   current_value["value"][0][name]
          // );
          switch (widget.type) {
            case "graph": {
              let data = current_value.value.map(_record => {
                return { y: _record[name], x: Date.parse(_record.time) };
              });
              view = (
                <WidgetGraph
                  getHistoryOf={days => getHistoryOf(days)}
                  widgetId={widget.id}
                  data={data}
                  yAxisTitleText={name}
                  title={name}
                  series_name={name}
                  neverReflow={!this.props.showMenu}
                />
              );
              break;
            }
            case "solidgauge": {
              let {
                min_value: minValue = 0,
                max_value: maxValue = 100
              } = widget.data_source;
              view = (
                <WidgetGauge
                  point={Number.parseFloat(_value)}
                  title={name}
                  time={time}
                  minValue={Number.parseInt(minValue)}
                  maxValue={Number.parseInt(maxValue)}
                  unit={unit}
                  widgetId={widget.id}
                  neverReflow={!this.props.showMenu}
                />
              );
              break;
            }
            case "image": {
              if (!_value.includes(apiUrl)) {
                _value = `${apiUrl}/sensors/${
                  this.props.sensor.info.id
                }/files/${_value}?sensor_key=${this.props.sensor.info.key}`;
              }
              view = <WidgetImage alt={name} time={time} src={_value} />;
              break;
            }
            case "map": {
              let latlng = [
                  current_value["value"][0][widget.map_options.latitude_param],
                  current_value["value"][0][widget.map_options.longitude_param]
                ],
                _t = new Date(time),
                markerText = `<span>${
                  this.props.sensor.info.name
                }</span><br/><span>Last-updated: ${_t}</span>`;
              _t = _t.toLocaleTimeString();
              this.logger(
                "@render_widgets:map:latlng, markerText, _t",
                latlng,
                markerText,
                _t
              );
              view = <WidgetMap position={latlng} markerText={markerText} />;
              break;
            }
            case "custom": {
              view = (
                <WidgetCustom widget={widget} sensor={this.props.sensor} />
              );
              break;
            }
            case "toggle": {
              let current_sensor_type =
                  this.props.sensorTypes[this.props.sensor.info.type] ||
                  undefined,
                current_sensor_config = current_sensor_type
                  ? current_sensor_type.config_fields[
                      widget.data_source.config_name
                    ] || undefined
                  : undefined,
                menu_options =
                  current_sensor_config && current_sensor_config["options"]
                    ? current_sensor_config.options
                        .split(",")
                        .map(_v => Number.parseInt(_v))
                    : [],
                field_type = current_sensor_config
                  ? current_sensor_config.field_type || undefined
                  : undefined;
              if (
                field_type &&
                field_type === "select" &&
                menu_options.length == 2 &&
                menu_options.includes(0)
              ) {
                /*
                 Toggle is a specific widget for sensor types with a config field which has field_type set to 'select' and
                 only two options to set (which are separated by ',' and must be 0 and some other non-falsy number ie. stating boolean true and false state).
                */
                let currently = this.props.sensor.live_updates.config[
                    widget.data_source.config_name
                  ], // current value of the config
                  setConfig = to => {
                    let value = menu_options.filter(_v => {
                      if (to) {
                        return _v;
                      } else {
                        return !_v;
                      }
                    });
                    value = value[0];
                    return this.props.setConfigValue(
                      widget.data_source.config_name,
                      value
                    );
                  },
                  label = widget.data_source.config_name;
                view = (
                  <WidgetToggle
                    currently={Boolean(currently)}
                    setConfig={to => setConfig(to)}
                    disabled={showMenu}
                  />
                );
              } else {
                view = (
                  <div>
                    {
                      "Toggling is not an option for this kind of widget. You may try slider."
                    }
                  </div>
                );
              }

              break;
            }
            case "slider": {
              let current_sensor_type =
                  this.props.sensorTypes[this.props.sensor.info.type] ||
                  undefined,
                current_sensor_config = current_sensor_type
                  ? current_sensor_type.config_fields[
                      widget.data_source.config_name
                    ] || undefined
                  : undefined,
                field_type = current_sensor_config
                  ? current_sensor_config.field_type || undefined
                  : undefined,
                {
                  min_value: min = 0,
                  max_value: max = 100
                } = widget.data_source;
              if (
                field_type === "int(text)" ||
                field_type === "decimal(text)"
              ) {
                let currently = this.props.sensor.live_updates.config[
                    widget.data_source.config_name
                  ],
                  setConfig = to => {
                    return this.props.setConfigValue(
                      widget.data_source.config_name,
                      to
                    );
                  };
                view = (
                  <WidgetSlider
                    descrete={field_type === "int(text)" ? false : true}
                    setConfig={to => setConfig(to)}
                    currently={currently}
                    min={min}
                    max={max}
                    disabled={showMenu}
                  />
                );
              } else {
                view = (
                  <div>
                    {
                      "Sliding is not an option for this kind of widget. You may try Toggle."
                    }
                  </div>
                );
              }
              break;
            }
            case "text":
            default: {
              let {
                  text_widget_options: { label_true = "", label_false = "" } = {
                    label_true: "",
                    label_false: ""
                  }
                } = widget,
                sensor_time_out =
                  this.props.sensorTypes[this.props.sensor.info.type][
                    "status_timeout"
                  ] || undefined, // status_timeout in minutes
                _t = Date.parse(time) / (1000 * 60), // _t: most recent update time in minutes.
                _n = Date.now() / (1000 * 60), // _n: current time in minutes
                online =
                  sensor_time_out && _n - _t > sensor_time_out ? false : true;
              // this.logger(
              //   "@render_widgets_timeOut, sensor_time_out, _n, _t, _n-_t, this.props.sensorTypes[this.props.sensor.info.type]",
              //   sensor_time_out,
              //   _n,
              //   _t,
              //   _n - _t,
              //   this.props.sensorTypes[this.props.sensor.info.type]
              // );
              view = (
                <WidgetText
                  value={_value}
                  unit={unit}
                  labelTrue={label_true}
                  labelFalse={label_false}
                  online={online}
                />
              );
            }
          }
        }
        break;
      }
      case "loading": {
        view = <LinearProgress />;
      }
    }
    // this.logger("@render_view", view);
    return view;
  }
  render() {
    let { className, style, loading, mode } = this.props,
      { type, id, title, sub_title } = this.props.widget,
      overflowY = mode == "edit" ? "auto" : "unset";

    return (
      <Widget
        style={{ ...style, overflowY }}
        title={title}
        subtitle={sub_title}
        readOnly={false}
        onRemoveWidget={() => this.onRemoveWidget(id)}
        onConfigure={() => this.onConfigure()}
        configuring={mode === "edit" ? true : false}
        showLoader={loading}
        readOnly={!this.props.showMenu}
      >
        {this.render_view()}
        <Dialog
          title="Configure widget"
          modal={false}
          open={mode === "edit" ? true : false}
          autoScrollBodyContent={true}
          onRequestClose={() => this.onCancelSave()}
        >
          <EditWidget
            dashboardType={this.props.dashboardType}
            widget={this.props.widget}
            onChangeWidget={widget => this.onChangeWidget(widget)}
            onSave={() => this.onSave()}
            onCancelSave={() => this.onCancelSave()}
            sensorTypes={this.props.sensorTypes}
            sensor={this.props.sensor}
            cid={this.props.cid}
          />
        </Dialog>
      </Widget>
    );
  }
}
WidgetCustomDashboard.propTypes = {
  dashboardType: PropTypes.string, // shows the kind of dashboard.
  setConfigValue: PropTypes.func, // for actuators->config_changers.
  loading: PropTypes.bool, // loading of some sort.
  className: PropTypes.string,
  sensorTypes: PropTypes.object,
  mode: PropTypes.oneOf(["view", "edit", "loading"]),
  widget: PropTypes.object.isRequired,
  style: PropTypes.object,
  onConfigure: PropTypes.func.isRequired,
  onRemoveWidget: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancelSave: PropTypes.func.isRequired,
  onChangeWidget: PropTypes.func.isRequired,
  getHistoryOf: PropTypes.func,
  sensor: PropTypes.shape({
    info: PropTypes.object,
    live_updates: PropTypes.shape({
      config: PropTypes.object,
      value: PropTypes.array
    })
  }),
  cid: PropTypes.string.isRequired,
  showMenu: PropTypes.bool
};
WidgetCustomDashboard.defaultProps = {
  mode: "view",
  sensorTypes: [],
  loading: false,
  dashboardType: "general"
};
export default WidgetCustomDashboard;
