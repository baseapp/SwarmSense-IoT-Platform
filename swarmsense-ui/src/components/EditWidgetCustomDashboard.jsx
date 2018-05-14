/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import TextField from "material-ui/TextField";
import PropTypes from "prop-types";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";
import AutoComplete from "material-ui/AutoComplete";
import CircularProgress from "material-ui/CircularProgress";
import RaisedButton from "material-ui/RaisedButton";
import FlatButton from "material-ui/FlatButton";
import { Step, Stepper, StepLabel, StepContent } from "material-ui/Stepper";
import { getSensors } from "../rest";
import { get_logger } from "../utils";

/**
 * A component to edit the widget of custom/user dashboard.
 */

class EditWidgetCustomDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.logger = get_logger("EditWidget");
    let autocomplete_sensor = "";
    if (props.sensor && props.sensor.info && props.sensor.info.name) {
      autocomplete_sensor = props.sensor.info.name;
    }
    this.state = {
      loading: false,
      autocomplete_sensor,
      dataSource: [],
      autocomplete_loading: false,
      autocomplete_open_menu: false,
      finished: false,
      stepIndex: 0
    };
    this.widget_types = [
      "text",
      "solidgauge",
      "graph",
      "image",
      "slider",
      "toggle",
      "map",
      "custom"
    ];
  }
  handleNext = () => {
    const { stepIndex } = this.state;
    this.setState({
      stepIndex: stepIndex + 1,
      finished: stepIndex >= 2
    });
  };
  handlePrev = () => {
    const { stepIndex } = this.state;
    if (stepIndex > 0) {
      this.setState({ stepIndex: stepIndex - 1 });
    }
  };
  getStepContent(stepIndex) {
    let {
        type,
        id,
        title,
        sub_title,
        data_source: { param_unit, min_value, max_value }
      } = this.props.widget,
      { onChangeWidget } = this.props;
    switch (stepIndex) {
      case 0:
        return (
          <div
            id="widget-name"
            style={{
              display: "flex",
              flexDirection: "column"
            }}
          >
            <SelectField
              value={type}
              floatingLabelText="Widget type"
              onChange={(e, k, type) => {
                onChangeWidget({ ...this.props.widget, type });
              }}
            >
              {this.widget_types.map((widget, key) => {
                return (
                  <MenuItem
                    primaryText={
                      widget[0].toUpperCase() + widget.slice(1).toLowerCase()
                    }
                    value={widget}
                    key={key}
                  />
                );
              })}
            </SelectField>
            <TextField
              floatingLabelText="Title"
              value={title}
              onChange={(e, title) => {
                onChangeWidget({ ...this.props.widget, title });
              }}
              hintText="Title of the widget."
            />
            <TextField
              floatingLabelText="Sub-title"
              value={sub_title}
              onChange={(e, sub_title) => {
                onChangeWidget({ ...this.props.widget, sub_title });
              }}
              hintText="Subtitle of the widget"
            />
          </div>
        );
      case 1:
        return (
          <div
            id="widget-datasource"
            style={{
              display: "flex",
              flexDirection: "column"
            }}
          >
            <div>
              {this.props.sensor && (
                <div>
                  <span>
                    Sensor selected :{" "}
                    {this.props.sensor["info"]
                      ? this.props.sensor.info.name
                      : "Not selected!"}
                  </span>
                </div>
              )}
              <AutoComplete
                searchText={this.state.autocomplete_sensor}
                disabled={
                  this.state.autocomplete_loading ||
                  this.props.dashboardType !== "general"
                }
                floatingLabelText="Change Sensor"
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
                disabled={this.props.dashboardType !== "general"}
                label={
                  this.state.autocomplete_loading ? (
                    <CircularProgress />
                  ) : (
                    "Search sensors"
                  )
                }
                disabled={
                  this.state.autocomplete_loading ||
                  !this.state.autocomplete_sensor
                }
                onClick={() => this.loadDataSources()}
              />
            </div>
            {this.render_parameter_field()}
            <TextField
              value={param_unit}
              floatingLabelText="Reading unit"
              onChange={(e, param_unit) => {
                onChangeWidget({
                  ...this.props.widget,
                  data_source: {
                    ...this.props.widget.data_source,
                    param_unit
                  }
                });
              }}
            />
            <TextField
              value={min_value}
              floatingLabelText="Minimum value"
              onChange={(e, min_value) => {
                onChangeWidget({
                  ...this.props.widget,
                  data_source: { ...this.props.widget.data_source, min_value }
                });
              }}
            />
            <TextField
              value={max_value}
              floatingLabelText="Maximum value"
              onChange={(e, max_value) => {
                onChangeWidget({
                  ...this.props.widget,
                  data_source: { ...this.props.widget.data_source, max_value }
                });
              }}
            />
          </div>
        );
      case 2:
        return (
          <div
            id="widget-configure"
            style={{
              display: "flex",
              flexDirection: "column"
            }}
          >
            {this.render_widget_configure()}
          </div>
        );
      default:
        return "You're a long way from home sonny jim!";
    }
  }
  loadDataSources() {
    this.setState({ ...this.state, autocomplete_loading: true }, async () => {
      try {
        let { cid } = this.props;
        let { data: dataSource } = await getSensors({
          cid,
          name: this.state.autocomplete_sensor,
          perPage: 10,
          field: "name"
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
  onUpdateInput(autocomplete_sensor, dataSource, params) {
    this.setState({ ...this.state, autocomplete_sensor });
  }
  onNewRequest(chosenRequest, index) {
    let sensor = this.state.dataSource.filter(
      _sensor => _sensor.name === chosenRequest
    )[0];
    this.props.onChangeWidget({
      ...this.props.widget,
      data_source: {
        ...this.props.widget.data_source,
        sensor_id: sensor.id,
        sensor
      }
    });
    this.setState({ ...this.state, autocomplete_open_menu: false });
  }
  render_parameter_field() {
    // this.logger(
    //   "@render_parameter_field",
    //   this.props.sensorTypes,
    //   this.props.sensor
    // );
    if (
      !this.props["sensor"] ||
      !this.props.sensor["info"] ||
      !this.props.sensor.info["type"]
    ) {
      // if there is no sensor.
      return null;
    } else {
      let field = null,
        sensor_type = this.props.sensor.info.type,
        param_names = Object.getOwnPropertyNames(
          this.props.sensorTypes[sensor_type].fields
        ),
        config_names = Object.getOwnPropertyNames(
          this.props.sensorTypes[sensor_type].config_fields
        ),
        {
          type,
          map_options: { longitude_param, latitude_param },
          data_source: { config_name, param_name }
        } = this.props.widget,
        { onChangeWidget } = this.props;
      switch (type) {
        case "map": {
          field = (
            <div>
              <SelectField
                floatingLabelText="Logitude"
                value={longitude_param}
                onChange={(e, k, longitude_param) => {
                  onChangeWidget({
                    ...this.props.widget,
                    map_options: {
                      ...this.props.widget.map_options,
                      longitude_param
                    }
                  });
                }}
              >
                {param_names.map(param => {
                  return <MenuItem primaryText={param} value={param} />;
                })}
              </SelectField>
              <SelectField
                floatingLabelText="Latitude"
                value={latitude_param}
                onChange={(e, k, latitude_param) => {
                  onChangeWidget({
                    ...this.props.widget,
                    map_options: {
                      ...this.props.widget.map_options,
                      latitude_param
                    }
                  });
                }}
              >
                {param_names.map(param => {
                  return <MenuItem primaryText={param} value={param} />;
                })}
              </SelectField>
            </div>
          );
          break;
        }
        case "slider":
        case "toggle": {
          field = (
            <SelectField
              floatingLabelText="Configuration parameter"
              value={config_name}
              onChange={(e, k, config_name) => {
                let widget = {
                  ...this.props.widget,
                  data_source: { ...this.props.widget.data_source, config_name }
                };
                onChangeWidget(widget);
              }}
            >
              {config_names.map((config, key) => {
                return (
                  <MenuItem primaryText={config} value={config} key={key} />
                );
              })}
            </SelectField>
          );
          break;
        }
        case "text":
        case "graph":
        case "solidgauge":
        default: {
          field = (
            <SelectField
              floatingLabelText="Parameter"
              value={param_name}
              onChange={(e, k, param_name) => {
                onChangeWidget({
                  ...this.props.widget,
                  data_source: { ...this.props.widget.data_source, param_name }
                });
              }}
            >
              {param_names.map((param, key) => {
                return <MenuItem primaryText={param} value={param} key={key} />;
              })}
            </SelectField>
          );
        }
      }
      return field;
    }
  }
  render_widget_configure() {
    let configure = null,
      configure_custom_hint_text =
        "JS function body that return html. Ex. ''return `${value} @ ${time.toLocaleTimeString()}`'', etc." +
        "Accepts these arguments - sensor_name, sensor_id, sensor_key, name(name of the parameter), unit(unit of the parameter, if given!), value(current value of parameter), time(A date object)",
      {
        type,
        custom_widget_options: { fbody },
        text_widget_options: { label_true = "", label_false = "" } = {
          label_true: "",
          label_false: ""
        }
      } = this.props.widget,
      { onChangeWidget } = this.props;
    switch (type) {
      case "custom": {
        configure = (
          <TextField
            multiLine={true}
            rows={5}
            fullWidth
            rowsMax={10}
            floatingLabelText="Write your own widget."
            value={fbody}
            hintText={configure_custom_hint_text}
            onChange={(e, fbody) =>
              onChangeWidget({
                ...this.props.widget,
                custom_widget_options: { fbody }
              })
            }
          />
        );
        break;
      }
      case "text": {
        configure = (
          <div>
            <TextField
              floatingLabelText="Placeholder for truth value"
              value={label_true}
              onChange={(e, label_true) =>
                onChangeWidget({
                  ...this.props.widget,
                  text_widget_options: { label_false, label_true }
                })
              }
            />
            <br />
            <TextField
              rowsMax={10}
              floatingLabelText="Placeholder for false value"
              value={label_false}
              onChange={(e, label_false) =>
                onChangeWidget({
                  ...this.props.widget,
                  text_widget_options: { label_true, label_false }
                })
              }
            />
          </div>
        );
        break;
      }
      case "solidgauge":
      case "image":
      case "map":
      case "graph":
      case "slider":
      case "toggle":
      default: {
        configure = null;
      }
    }
    return configure;
  }
  render() {
    // this.logger("@render this.props.sensor", this.props.sensor);
    return (
      <div
        key={this.props.id}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Stepper activeStep={this.state.stepIndex} orientation="vertical">
          <Step>
            <StepLabel>Set title, sub-title & type for the widget</StepLabel>
            <StepContent>
              {this.getStepContent(0)}
              <div>
                <FlatButton
                  label="Back"
                  disabled={this.state.stepIndex === 0}
                  onClick={this.handlePrev}
                  style={{ marginRight: 12 }}
                />
                <RaisedButton
                  label={this.state.stepIndex === 2 ? "Finish" : "Next"}
                  primary={true}
                  onClick={this.handleNext}
                />
              </div>
            </StepContent>
          </Step>
          <Step>
            <StepLabel>
              Set sensor, parameter/configuration, unit(if relevant), minimum
              and maximum value for the parameter's value
            </StepLabel>
            <StepContent>
              {this.getStepContent(1)}
              <div>
                <FlatButton
                  label="Back"
                  disabled={this.state.stepIndex === 0}
                  onClick={this.handlePrev}
                  style={{ marginRight: 12 }}
                />
                <RaisedButton
                  label={this.state.stepIndex === 2 ? "Finish" : "Next"}
                  primary={true}
                  onClick={this.handleNext}
                />
              </div>
            </StepContent>
          </Step>
          <Step>
            <StepLabel>Other options</StepLabel>
            <StepContent>
              {this.getStepContent(2)}
              <div>
                <FlatButton
                  label="Back"
                  disabled={this.state.stepIndex === 0}
                  onClick={this.handlePrev}
                  style={{ marginRight: 12 }}
                />
                <RaisedButton
                  label={this.state.stepIndex === 2 ? "Finish" : "Next"}
                  primary={true}
                  onClick={this.handleNext}
                />
              </div>
            </StepContent>
          </Step>
        </Stepper>
        <div>
          {this.state.finished ? (
            <div id="widget-save" style={{ display: "flex", flexWrap: "wrap" }}>
              <FlatButton
                primary
                label="Save"
                onClick={() => this.props.onSave()}
              />
              <FlatButton
                primary
                label="Cancel"
                onClick={() => this.props.onCancelSave()}
              />
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

EditWidgetCustomDashboard.propTypes = {
  widget: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string,
    title: PropTypes.string,
    sub_title: PropTypes.string,
    data_source: PropTypes.shape({
      sensor_id: PropTypes.string,
      param_name: PropTypes.string,
      param_unit: PropTypes.string,
      config_name: PropTypes.string,
      min_value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      max_value: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    }),
    image_options: PropTypes.object,
    map_options: PropTypes.shape({
      latitude_param_name: PropTypes.string,
      longitude_param_name: PropTypes.string
    }),
    custom_widget_options: PropTypes.shape({
      fbody: PropTypes.string
    })
  }),
  onChangeWidget: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancelSave: PropTypes.func.isRequired,
  sensorTypes: PropTypes.object,
  sensor: PropTypes.object,
  cid: PropTypes.string.isRequired
};
EditWidgetCustomDashboard.defaultProps = {
  onChangeWidget: f => f,
  widget: {
    type: undefined,
    id: undefined,
    title: undefined,
    sub_title: undefined,
    data_source: {
      network_id: "",
      sensor_id: "",
      param_name: "",
      param_unit: "",
      config_name: "",
      min_value: "",
      max_value: ""
    },
    toggle_options: {},
    slider_options: {},
    file_options: {},
    text_options: {},
    solidgauge_options: {},
    graph_options: {},
    map_options: {
      longitude_param: undefined,
      latitude_param: undefined
    },
    custom_widget_options: {
      fbody: undefined
    }
  }
};
export default EditWidgetCustomDashboard;
