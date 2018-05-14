/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import PropTypes from "prop-types";
import Slider from "material-ui/Slider";
import CircularProgress from "material-ui/CircularProgress";
import { get_logger } from "../utils";
class WidgetSlider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      _slider: Number.parseInt(props.currently, 10) || undefined
    };
    this.logger = get_logger("WidgetSlider");
  }
  setConfig() {
    this.setState({ ...this.state, loading: true }, async () => {
      try {
        await this.props.setConfig(this.state._slider);
        this.setState({ ...this.state, loading: false });
      } catch (e) {
        this.logger("@postSettingSlider", e.message);
        this.setState({
          ...this.state,
          loading: false,
          _slider: Number.parseInt(this.props.currently, 10) || undefined
        });
      }
    });
  }
  componentWillReceiveProps({ currently }) {
    if (currently !== this.state._slider) {
      this.setState({ ...this.state, _slider: currently });
    }
  }
  render() {
    let view = undefined;
    if (this.state.loading) {
      view = <CircularProgress />;
    } else {
      let { min, max } = this.props;
      min = Number.parseInt(min, 10);
      max = Number.parseInt(max, 10);
      let step = 1 / (max - min),
        getConfigValue = sliderValue => {
          let config_value = sliderValue * (max - min) + min;

          return config_value;
        },
        getSliderValue = configValue => {
          let slider_value = (configValue - min) / (max - min);
          // console.log(
          //   "min, max, configValue, slider_value",
          //   min,
          //   max,
          //   configValue,
          //   slider_value
          // );
          return slider_value;
        };
      view = (
        <Slider
          disabled={this.props.disabled}
          min={0}
          max={1}
          value={getSliderValue(this.state._slider)}
          onChange={(e, value) =>
            this.setState({
              ...this.state,
              _slider: getConfigValue(value)
            })
          }
          step={step}
          onDragStop={e => this.setConfig()}
        />
      );
    }
    return (
      <div style={{ ...this.props.style, width: "100%", height: "100%" }}>
        {view}
        {!this.props.disabled && (
          <p> Current value : {Math.round(this.state._slider)} </p>
        )}
      </div>
    );
  }
}

WidgetSlider.propTypes = {
  setConfig: PropTypes.func.isRequired,
  style: PropTypes.object,
  min: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  max: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  disabled: PropTypes.bool,
  descrete: PropTypes.bool, // if not continous
  currently: PropTypes.oneOfType([PropTypes.number, PropTypes.string]) // states the current state.
};
WidgetSlider.defaultProps = {
  descrete: true,
  min: 0,
  max: 100,
  disabled: false
};
export default WidgetSlider;
