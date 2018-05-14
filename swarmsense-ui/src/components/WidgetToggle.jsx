/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import PropTypes from "prop-types";
import Toggle from "material-ui/Toggle";
import CircularProgress from "material-ui/CircularProgress";
import { get_logger } from "../utils";
class WidgetToggle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      _switch: false
    };
    this.logger = get_logger("WidgetToggle");
  }
  onToggle(to) {
    this.setState({ ...this.state, loading: true }, async () => {
      try {
        await this.props.setConfig(to);
        this.setState({ ...this.state, loading: false, _switch: to });
      } catch (e) {
        this.logger("@postToggle", e.message);
        this.setState({ ...this.state, loading: false });
      }
    });
  }
  componentWillReceiveProps({ currently }) {
    if (currently !== this.state._switch) {
      this.setState({ ...this.state, _switch: currently });
    }
  }
  componentDidMount() {
    this.setState({
      ...this.state,
      _switch: this.props.currently
    });
  }
  render() {
    let view = undefined;
    if (this.state.loading) {
      view = <CircularProgress />;
    } else {
      view = (
        <Toggle
          onToggle={(e, checked) => this.onToggle(checked)}
          toggled={this.state._switch}
          disabled={this.props.disabled || false}
        />
      );
    }
    return <div style={this.props.style}>{view}</div>;
  }
}

WidgetToggle.propTypes = {
  setConfig: PropTypes.func.isRequired,
  style: PropTypes.object,
  disabled: PropTypes.bool,
  currently: PropTypes.bool // states the current state.
};

export default WidgetToggle;
