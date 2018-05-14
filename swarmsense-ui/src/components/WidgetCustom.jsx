/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import PropTypes from "prop-types";
import { get_logger } from "../utils";
class WidgetCustom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      widget_maker: undefined,
      error: "",
      loading: ""
    };
    this.logger = get_logger("WidgetCustom");
  }
  make_custom_widget_maker(fbody = null) {
    try {
      let {
        widget: { custom_widget_options: { fbody: function_body } }
      } = this.props;
      if (fbody) {
        function_body = fbody;
      }
      if (function_body) {
        let custom_widget_maker = new Function(
          "sensor_name, sensor_id, sensor_key, name, unit, value, time",
          function_body
        );
        this.setState({ widget_maker: custom_widget_maker, loading: false });
      } else {
        this.setState({
          error: "Please configure sensor and fill in the function body!",
          loading: false
        });
      }
    } catch (e) {
      this.setState({
        error: "Error while creating widget! " + e.message,
        loading: false
      });
      this.logger("@cdm: error while making widget maker", e.message || e);
    }
  }
  componentWillReceiveProps({
    widget: { custom_widget_options: { fbody: function_body } }
  }) {
    if (this.props.widget.custom_widget_options.fbody !== function_body) {
      this.make_custom_widget_maker(function_body);
    }
  }
  componentDidMount() {
    this.make_custom_widget_maker();
  }
  render() {
    this.logger("@render", this.props);
    let {
        widget: {
          data_source: { param_name: name, param_unit: unit },
          custom_widget_options: { fbody: function_body }
        },
        sensor: {
          info: { id: sensor_id, name: sensor_name, key: sensor_key },
          live_updates: { value: _value }
        },
        style
      } = this.props,
      current_value = _value[0],
      value = current_value[name],
      time = new Date(current_value["time"]),
      result = this.state.widget_maker
        ? this.state.widget_maker(
            sensor_name,
            sensor_id,
            sensor_key,
            name,
            unit,
            value,
            time
          )
        : this.state.error
          ? `<div>${this.state.error}</div>`
          : "<div>...Loading</div>";

    // this.logger("@render", result);
    return <div dangerouslySetInnerHTML={{ __html: result }} style={style} />;
  }
}

WidgetCustom.propTypes = {
  widget: PropTypes.object.isRequired,
  sensor: PropTypes.object.isRequired,
  style: PropTypes.object
};
export default WidgetCustom;
