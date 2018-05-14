/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import { Forwarder } from "./index";
import PropTypes from "prop-types";

class WithLogin extends React.Component {
  is_logged_in() {
    let token = window.sessionStorage.getItem("token");
    if (token) {
      return true;
    } else {
      return false;
    }
  }
  render() {
    if (this.is_logged_in()) {
      return this.props.children;
    } else {
      return (
        <Forwarder
          to="login"
          message="Please login to continue"
          message_class="warning"
        />
      );
    }
  }
}

WithLogin.propTypes = {
  children: PropTypes.element
};

export default WithLogin;
