/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React, { Component } from "react";
import defaultTheme from "admin-on-rest/lib/mui/defaultTheme";
import { userLogin as userLoginAction } from "admin-on-rest/lib/actions/authActions";
import translate from "admin-on-rest/lib/i18n/translate";
import Notification from "admin-on-rest/lib/mui/layout/Notification";
import { connect } from "react-redux";
import compose from "recompose/compose";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import { reduxForm } from "redux-form";
import PropTypes from "prop-types";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import { Login } from "./index";
import { parse_query } from "../utils";

class LoginPage extends Component {
  parse_query() {
    let hash = window.location.hash;
    let parsed_query = parse_query(hash.slice(7));
    // console.log(parsed_query)
    let parsed_object = {};
    parsed_query.map(ob => {
      Object.getOwnPropertyNames(ob).map(n => {
        parsed_object[n] = ob[n];
        return null;
      });
      return null;
    });
    // console.log(parsed_object)
    return parsed_object;
  }
  render() {
    const muiTheme = getMuiTheme(this.props.theme);
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          <Login
            {...this.props}
            changeView={v => this.context.router.history.push(v)}
            muiTheme={muiTheme}
          />
          <Notification />
        </div>
      </MuiThemeProvider>
    );
  }
}

LoginPage.defaultProps = {
  theme: defaultTheme
};

LoginPage.contextTypes = {
  router: PropTypes.object
};

const enhance = compose(
  translate,
  reduxForm({
    form: "signIn",
    validate: (values, props) => {
      const errors = {};
      const { translate } = props;
      if (!values.username)
        errors.username = translate("aor.validation.required");
      if (!values.password)
        errors.password = translate("aor.validation.required");
      return errors;
    }
  }),
  connect(null, { userLogin: userLoginAction })
);
export default enhance(LoginPage);
