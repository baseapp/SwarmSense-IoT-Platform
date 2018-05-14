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
    minHeight: 200,
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

class ForgotPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      forgotp: { email: "" }
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
   * resets the forget-password form
   */
  clear_forgotp() {
    this.setState({ ...this.state, forgotp: { email: "" } });
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
   * Handles the reset password process after the code is received by the user.
   * Validates the input, request to endpoint for resetting, notify users accordingly.
   */
  forgot_password() {
    let { email } = this.state.forgotp;
    let v_email = this.is_valid_email(email);
    if (v_email) {
      restClient("CREATE", "forgot-password", {
        data: { ...this.state.forgotp }
      })
        .then(json => {
          this.clear_forgotp();
          this.setState({ ...this.state, content_flag: "resetp" });
          this.notify(
            "Enter the code recieved at your registered email address."
          );
        })
        .catch(err => {
          this.notify(err.message, "warning");
        });
    } else {
      this.notify("Please fill the field properly", "warning");
    }
  }
  /***
   * Creates the forgot-password form
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
                floatingLabelText="Email"
                value={this.state.forgotp.email}
                onChange={(e, v) => {
                  this.setState({
                    ...this.state,
                    forgotp: { ...this.state.forgotp, email: v }
                  });
                }}
              />
            </div>
          </div>
          <CardActions>
            <RaisedButton
              style={{ marginBottom: "2px" }}
              label="Send code to my email"
              primary
              fullWidth
              onClick={() => this.forgot_password()}
            />
            <RaisedButton
              style={{ marginBottom: "2px" }}
              label="Verify Email"
              primary
              fullWidth
              onClick={() => this.context.router.history.push("/verify-email")}
            />
            <RaisedButton
              label="Back to login"
              primary
              fullWidth
              style={{ marginBottom: "2px" }}
              onClick={() => this.context.router.history.push("/login")}
            />
          </CardActions>
        </Card>
      </div>
    );
  }
}
ForgotPassword.contextTypes = {
  router: PropTypes.object
};
ForgotPassword = connect()(muiThemeable()(ForgotPassword));
export default ForgotPassword;
