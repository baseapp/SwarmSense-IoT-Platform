/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import { connect } from "react-redux";
import { showNotification } from "admin-on-rest";
import CircularProgress from "material-ui/CircularProgress";
import FlatButton from "material-ui/FlatButton";
import { get_token } from "../utils";

class LoginAs extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isLoading: false, warning_understood: false };
  }
  /***
   * Requests for the token of an user
   * @param {String} user_id user id of a user
   */
  get_token(uid) {
    return get_token(uid);
  }
  render() {
    if (this.state.isLoading) {
      return <CircularProgress />;
    } else {
      return (
        <FlatButton
          label="Login"
          primary={true}
          onClick={() => {
            let new_window;
            this.setState({ ...this.state, isLoading: true });
            this.get_token(this.props.uid)
              .then(token => {
                // got the token
                let config = `?config=${window.encodeURI(
                    JSON.stringify({
                      command: "login_as",
                      payload: token
                    })
                  )}`,
                  warning_understood = this.state.warning_understood,
                  new_window = window.open(
                    window.location.origin + config, // developmental
                    "_blank",
                    "toolbar=yes, location=yes, status=yes, menubar=yes, scrollbars=yes"
                  );
                if (new_window) {
                  this.props.dispatch(
                    showNotification("Logged in the newly opened window.")
                  );
                  if (warning_understood === false) {
                    warning_understood = window.confirm(
                      "Note - Logged in user context is limited to newly opened window only!"
                    );
                    console.log("warning_understood", warning_understood);
                  }
                } else {
                  this.props.dispatch(
                    showNotification(
                      "Allow pop-ups for this feature to work and try again!",
                      "warning"
                    )
                  );
                }
                this.setState({
                  ...this.state,
                  isLoading: false,
                  warning_understood
                });
              })
              .catch(err => {
                this.props.dispatch(showNotification(err.message));
                this.setState({
                  ...this.state,
                  isLoading: false
                });
              });
          }}
        />
      );
    }
  }
}

LoginAs = connect(state => {
  return {
    admin:
      state.postLoginInitials.current_user.role === "super_admin" ? true : false
  };
})(LoginAs);

export default /**
 * @name LoginAs
 * @example <LoginAs/>
 * @description A react ui component(material-flatbutton) for login-as feature.
 * It is to login as another user while logged in as admin.
 */
LoginAs;
