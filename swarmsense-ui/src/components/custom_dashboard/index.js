/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import SCustomDashboard from "./CustomDashboard";
import LinearProgress from "material-ui/LinearProgress";
import Forwarder from "../Forwarder";
import InjectParams from "../InjectParams";
import { resolveIfCompany } from "../../utils";
// import { get_logger } from "../../utils";
function TCustomDashboard(props) {
  // let logger = get_logger("@CustomDashboard.index");
  // logger("props", props);
  let {
    match: { params: { dashboard_id, sensor_id } },
    global_company: { id: company_id }
  } = props;
  if (!dashboard_id) {
    // console.log("...no dashboard id");
    return <div>No dashboard id found!</div>;
  }
  if (!company_id) {
    return <div>No company found!</div>;
  }
  if (sensor_id) {
    return (
      <SCustomDashboard
        company_id={company_id}
        dashboard_id={dashboard_id}
        sensor_id={sensor_id}
      />
    );
  } else {
    return (
      <SCustomDashboard company_id={company_id} dashboard_id={dashboard_id} />
    );
  }
  // return <div>hello world</div>;
}
let CustomDashboard = props => (
  <InjectParams
    resolve={props => resolveIfCompany(props)}
    OnFailResolve={<Forwarder to="/" message="No company found!!" />}
  >
    <TCustomDashboard {...props} />
  </InjectParams>
);
export { CustomDashboard };
