/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import RaisedButton from "material-ui/RaisedButton";
import { showNotification } from "admin-on-rest";
import TextField from "material-ui/TextField";
import { Card, CardActions, CardTitle } from "material-ui/Card";
import { connect } from "react-redux";
import { cyan500, pinkA200 } from "material-ui/styles/colors";
import { PropTypes } from "prop-types";
import muiThemeable from "material-ui/styles/muiThemeable";
import { rest_client as restClient } from "../rest";
const styles = {
  main: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    alignItems: "center",
    justifyContent: "center"
  },
  card: {
    maxHeight: 450,
    minHeight: 450,
    minWidth: 300,
    maxWidth: 300
  },
  form: {
    padding: "0 1em 1em 1em"
  },
  input: {
    display: "flex"
    // flexDirection:'column'
  }
};

function getColorsFromTheme(theme) {
  if (!theme) return { primary1Color: cyan500, accent1Color: pinkA200 };
  const { palette: { primary1Color, accent1Color } } = theme;
  return { primary1Color, accent1Color };
}

class ResetPassword extends React.Component {
  constructor(props) {
    super(props);
    let { email = "", code = "" } = this.props.params;
    this.state = {
      resetp: { code, email, password: "" }
    };
  }
  /***
   * alerts the user
   * @param {String} message Message to be given to the user
   * @param {String} [type=notice] type of message ex. notice, warning, etc.
   */
  notify(message, type = "notice") {
    this.props.dispatch(showNotification(message, type));
  }
  /***
   * resets the reset password form
   */
  clear_resetp() {
    this.setState({
      ...this.state,
      resetp: { code: "", password: "", email: "" }
    });
  }
  /***
   * checks the validity of the email
   * @param {String} email email of the user
   * @returns {Boolean} true if valid email, else false
   */
  is_valid_email(email) {
    return email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
      ? true
      : false;
  }
  /***
   * checks the validity of a string given
   * @param {String} str string to validate
   * @param {Number} [min_length=3] valid minimum length of the string
   * @param {Number} [max_length=15] valid maximum length of the string
   * @param {Regex} [regex=false] a regex expression to validate the string
   * @returns {Boolean} true, if valid string, else false.
   */
  is_valid_str(str, min_length = 3, max_length = 15, regex = false) {
    if (regex) {
      return str &&
        str.length >= min_length &&
        str.length <= max_length &&
        str.match(regex)
        ? true
        : false;
    } else {
      return str && str.length >= min_length && str.length <= max_length
        ? true
        : false;
    }
  }
  /***
   * Handles the reset password process. Validates the input, request to
   * endpoint for resetting, notify users accordingly.
   */
  reset_password() {
    let { code, email, password } = this.state.resetp;
    let v_email = this.is_valid_email(email);
    let v_code = this.is_valid_str(code, 5, 15);
    let v_pass = this.is_valid_str(password);
    if (v_email && v_code && v_pass) {
      restClient("CREATE", "reset-password", { data: { ...this.state.resetp } })
        .then(json => {
          this.notify("Password changed successfully");
          this.clear_resetp();
          this.setState({ ...this.state, content_flag: "login" });
        })
        .catch(err => {
          this.notify(err.message, "warning");
        });
    } else {
      this.notify("Please fill all the fields properly", "warning");
    }
  }
  /***
   * Creates the reset-password form
   */
  render() {
    const { primary1Color } = getColorsFromTheme(this.props.muiTheme);
    return (
      <div style={{ ...styles.main, backgroundColor: primary1Color }}>
        <Card
          style={{
            ...styles.card,
            backgroundColor: "rgba(0,0,0,0)",
            color: "white",
            boxShadow: "none",
            minHeight: "50px",
            maxHeight: "150px",
            marginBottom: "5px"
          }}
        >
          <CardTitle style={{ textAlign: "center" }}>
            <h1>{window.application.settings.site_title || " "}</h1>
          </CardTitle>
        </Card>
        <Card style={styles.card}>
          <CardTitle>Recover Password</CardTitle>
          <div style={styles.form}>
            <div style={styles.input}>
              <TextField
                floatingLabelText="Code sent to the email"
                value={this.state.resetp.code}
                onChange={(e, v) => {
                  this.setState({
                    ...this.state,
                    resetp: { ...this.state.resetp, code: v }
                  });
                }}
              />
            </div>
            <div style={styles.input}>
              <TextField
                floatingLabelText="Email"
                value={this.state.resetp.email}
                onChange={(e, v) => {
                  this.setState({
                    ...this.state,
                    resetp: { ...this.state.resetp, email: v }
                  });
                }}
              />
            </div>
            <div style={styles.input}>
              <TextField
                floatingLabelText="New Password"
                value={this.state.resetp.password}
                type="password"
                onChange={(e, v) => {
                  this.setState({
                    ...this.state,
                    resetp: { ...this.state.resetp, password: v }
                  });
                }}
              />
            </div>
          </div>
          <CardActions>
            <RaisedButton
              label="Reset Password"
              style={{ marginBottom: "2px" }}
              primary
              fullWidth
              onClick={() => this.reset_password()}
            />
            <RaisedButton
              label="Back to login"
              primary
              fullWidth
              onClick={() => this.context.router.history.push("/login")}
            />
          </CardActions>
        </Card>
      </div>
    );
  }
}
ResetPassword.contextTypes = {
  router: PropTypes.object
};
ResetPassword.propTypes = {
  params: PropTypes.object
};
ResetPassword.defaultProps = {
  params: {}
};
ResetPassword = connect()(muiThemeable()(ResetPassword));
export default ResetPassword;
