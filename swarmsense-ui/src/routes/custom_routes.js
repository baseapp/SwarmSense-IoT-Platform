/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
 
import React from "react";
import { Route } from "react-router-dom";
import {
  GraphSensorHistory as SensorHistory,
  UserProfile as Profile,
  CustomDashboard as CDash,
  Forwarder,
  Floormap,
  Tester,
  Signup,
  PasswordReset as ResetPassword,
  PasswordForgot as ForgotPassword
} from "../components";
import ConfirmEmail from "../components/ConfirmEmail";
const customRoutes = [
  <Route exact path="/sensor_chart" component={SensorHistory} />,
  <Route exact path="/profile" component={Profile} />,
  <Route
    exact
    path="/cdash"
    component={() => <Forwarder to="my_dashboards" />}
  />,
  <Route exact path="/cdash/:dashboard_id" component={CDash} />,
  <Route
    exact
    path="/cdash/:dashboard_id/device/:sensor_id"
    component={CDash}
  />,
  <Route
    exact
    path="/floormap"
    component={() => <Forwarder to="/company_networks" />}
  />,
  <Route exact path="/floormap/:network_id" component={Floormap} />,
  <Route exact path="/sign-up" component={Signup} />,
  <Route exact path="/recover-password" component={ForgotPassword} />,
  <Route exact path="/reset-password" component={ResetPassword} />,
  <Route exact path="/verify-email" component={ConfirmEmail} />
  // <Route
  //   exact
  //   path="/test/:test_id"
  //   component={props => {
  //     console.log(props);
  //     return <div>Hello world</div>;
  //   }}
  // />
];
export { customRoutes };
