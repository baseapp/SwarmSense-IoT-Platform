/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import PropTypes from "prop-types";
import { showNotification } from "admin-on-rest";
import { connect } from "react-redux";

class Forwarder extends React.Component {
  componentWillMount() {
    if (this.props.goBack) {
      this.context.router.history.goBack();
    } else if (this.props.reload) {
      this.context.router.history.replace(this.props.to);
      window.location.reload();
    } else {
      if (this.props.newWindow) {
        window.open(this.props.to);
        // this.context.router.history.goBack()
      } else {
        this.context.router.history.replace(this.props.to);
      }
      if (this.props.message) {
        if (this.props.message_class) {
          this.props.dispatch(
            showNotification(this.props.message, this.props.message_class)
          );
        } else {
          this.props.dispatch(showNotification(this.props.message, "warning"));
        }
      }
    }
  }
  render() {
    return null;
  }
}
Forwarder.contextTypes = {
  router: PropTypes.object
};
Forwarder = connect()(Forwarder);
export default /**
 * @name Forwarder
 * @example <Forwarder/>
 * @description A react component which before rendering
 * changes the route/location. It can also show a message
 * using the AOR action dispatching for notification.
 */
Forwarder;
