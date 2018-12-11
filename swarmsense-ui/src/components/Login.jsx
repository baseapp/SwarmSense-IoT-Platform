/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import PropTypes from "prop-types";
import { Card, CardActions, CardTitle } from "material-ui/Card";
import RaisedButton from "material-ui/RaisedButton";
import TextField from "material-ui/TextField";
import CircularProgress from "material-ui/CircularProgress";
import { cyan500, pinkA200 } from "material-ui/styles/colors";
import { propTypes, Field } from "redux-form";
const styles = {
  main: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    alignItems: "center",
    justifyContent: "center"
  },
  card: {
    maxHeight: 350,
    minHeight: 350,
    minWidth: 300,
    maxWidth: 300
  },
  form: {
    padding: "0 1em 1em 1em"
  },
  input: {
    display: "flex"
  }
};

// see http://redux-form.com/6.4.3/examples/material-ui/
const renderInput = ({
  meta: { touched, error } = {},
  input: { ...inputProps },
  ...props
}) => (
  <TextField
    errorText={touched && error}
    {...inputProps}
    {...props}
    fullWidth
  />
);
function getColorsFromTheme(theme) {
  if (!theme) return { primary1Color: cyan500, accent1Color: pinkA200 };
  const { palette: { primary1Color, accent1Color } } = theme;
  return { primary1Color, accent1Color };
}

class Login extends React.Component {
  login = auth =>
    this.props.userLogin(
      auth,
      this.props.location.state ? this.props.location.state.nextPathname : "/"
    );
  render() {
    const { handleSubmit, submitting, translate, muiTheme } = this.props;
    const { primary1Color } = getColorsFromTheme(muiTheme);
    return (
      <div>
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
            <CardTitle>Login</CardTitle>
            <form onSubmit={handleSubmit(this.login)}>
              <div style={styles.form}>
                <div style={styles.input}>
                  <Field
                    name="username"
                    component={renderInput}
                    floatingLabelText="Email"
                    disabled={submitting}
                  />
                </div>
                <div style={styles.input}>
                  <Field
                    name="password"
                    component={renderInput}
                    floatingLabelText={translate("aor.auth.password")}
                    type="password"
                    disabled={submitting}
                  />
                </div>
              </div>
              <CardActions>
                <RaisedButton
                  type="submit"
                  primary
                  disabled={submitting}
                  icon={
                    submitting && <CircularProgress size={25} thickness={2} />
                  }
                  label={translate("aor.auth.sign_in")}
                  fullWidth
                  style={{ marginTop: "2px", marginBottom: "2px" }}
                />
                <RaisedButton
                  label="Create account"
                  style={{ marginBottom: "2px" }}
                  onClick={() => this.props.changeView("sign-up")}
                  fullWidth
                  primary
                />
                <RaisedButton
                  style={{ marginBottom: "2px" }}
                  label="Forgot password?"
                  onClick={() => this.props.changeView("recover-password")}
                  fullWidth
                  primary
                />
              </CardActions>
            </form>
          </Card>
        </div>
      </div>
    );
  }
}

Login.propTypes = {
  ...propTypes,
  authClient: PropTypes.func,
  previousRoute: PropTypes.string,
  theme: PropTypes.object.isRequired,
  translate: PropTypes.func.isRequired,
  userLogin: PropTypes.func.isRequired
};

export default /**
 * @name Login
 * @example <Login/>
 * @description Class represents the login page in AOR workflow. It is given as
 * the value of the prop LoginPage to the Admin(AOR) component in the main application.
 */
Login;
