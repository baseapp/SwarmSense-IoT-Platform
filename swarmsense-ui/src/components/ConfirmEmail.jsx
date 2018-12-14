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

/**
 * It verifies the email during signup process.
 * @extends React.Component
 */

class ConfirmEmail extends React.Component {
  constructor(props) {
    super(props);
    let { email = "", code = "" } = this.props.params;
    this.state = {
      resetp: { code, email },
      reverify: false
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
   * resets the form
   */
  clear_resetp() {
    this.setState({
      ...this.state,
      resetp: { code: "", email: "" }
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
  resend_email() {
    let { email } = this.state.resetp;
    let v_email = this.is_valid_email(email);
    if (v_email) {
      restClient("CREATE", "resend-verification", { data: { email } })
        .then(json => {
          this.notify("Resent verification email");
          this.clear_resetp();
          this.setState({ ...this.state, reverify: false });
        })
        .catch(err => {
          this.notify(err.message, "warning");
        });
    } else {
      this.notify("Please fill the proper email.", "warning");
    }
  }
  /***
   * Handles the verify email process. Validates the input, request to
   * endpoint for resetting, notify users accordingly.
   */
  confirm_email() {
    let { code, email } = this.state.resetp;
    let v_email = this.is_valid_email(email);
    if (v_email) {
      restClient("CREATE", "verify", { data: { ...this.state.resetp } })
        .then(json => {
          this.notify("Verification completed successfully");
          this.clear_resetp();
          this.setState({ ...this.state });
        })
        .catch(err => {
          this.notify(err, "warning");
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
          <CardTitle>
            {this.state.reverify ? "Resend Verification Email" : "Verify email"}
          </CardTitle>
          <div style={styles.form}>
            {!this.state.reverify && (
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
            )}
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
          </div>
          <CardActions>
            <RaisedButton
              label={this.state.reverify ? "Send Mail" : "Verify email"}
              style={{ marginBottom: "2px" }}
              primary
              fullWidth
              onClick={() => {
                if (this.state.reverify) {
                  this.resend_email();
                } else {
                  this.confirm_email();
                }
              }}
            />
            <RaisedButton
              label={
                this.state.reverify
                  ? "Verify Email"
                  : "Resend verification email!"
              }
              style={{ marginBottom: "2px" }}
              primary
              fullWidth
              onClick={() =>
                this.setState({ ...this.state, reverify: !this.state.reverify })
              }
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
ConfirmEmail.contextTypes = {
  router: PropTypes.object
};
ConfirmEmail.propTypes = {
  params: PropTypes.object
};
ConfirmEmail.defaultProps = {
  params: {}
};
ConfirmEmail = connect()(muiThemeable()(ConfirmEmail));
export default ConfirmEmail;
