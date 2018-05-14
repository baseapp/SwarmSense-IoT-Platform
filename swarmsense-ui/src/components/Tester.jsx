/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import { get_logger } from "../utils";
import { Dashboard } from "./dashboard";
import { CustomDashboard } from "./index";
import Widget from "./WidgetGeneric";
import ReactGridLayout, { Responsive } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
const Tester = props => {
  let logger = get_logger("Tester"),
    cid1 = "a2fde8f1a6e9", //  image map, custom demo
    cid2 = "8a47354024c2f30c", // text, graph, gauge demo
    did1 = "45494c6296ee",
    did2 = "232badff408a",
    cid3 = "ed5c1cb85225", // toggle demo
    did3 = "22ddb8596df6",
    view = undefined;
  // logger(props);
  switch (props.match.params.test_id) {
    case "dash1": {
      view = <CustomDashboard dashboard_id={did1} company_id={cid1} />;
      break;
    }
    case "dash2": {
      view = <CustomDashboard dashboard_id={did2} company_id={cid2} />;
      break;
    }
    case "dash3":
    default: {
      view = <CustomDashboard dashboard_id={did3} company_id={cid3} />;
    }
  }
  return view;
  // return (
  //   <Dashboard title="My Dashboard">
  //     <ReactGridLayout
  //       className="layout"
  //       layout={layout}
  //       cols={12}
  //       rowHeight={30}
  //       width={1200}
  //     >
  //       <div key="0">
  //         <Widget title="My first widget" subtitle="Just joking!">
  //           Hello world
  //         </Widget>
  //       </div>
  //       <div key="1">
  //         <Widget title="Doodle-o-karma">World of Beacon</Widget>
  //       </div>
  //       <div key="2">
  //         <Widget title="Doodle-o-karma">World of Beacon</Widget>
  //       </div>
  //     </ReactGridLayout>
  //   </Dashboard>
  // );
};
export default Tester;
