/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import { List } from "admin-on-rest";
import {
  IteratorMap as MapIterator,
  ActionPanel,
  FilterSensor_name as SensorFilter,
  Forwarder
} from "./index";
import InjectParams from "./InjectParams";
import { resolveIfCompany } from "../utils";

class SensorsMap extends React.Component {
  render() {
    let customButtons = [];
    if (this.props.nid && this.props.network.id) {
      customButtons.push({
        label: "Sensors(network)",
        href: "#/company_network_sensors"
      });
    } else {
      customButtons.push({
        label: "Sensors",
        href: "#/company_sensors"
      });
    }
    return (
      <List
        title="Sensor maps"
        {...this.props}
        perPage={10000}
        actions={<ActionPanel customButtons={customButtons} />}
        filters={<SensorFilter />}
      >
        <MapIterator cid={this.props.global_company.id} />
      </List>
    );
  }
}

export default /**
 * @name SensorsMap
 * @description AOR based List component to render sensors over maps
 * @example <SensorsMap/>
 */
props => (
  <InjectParams
    resolve={resolveIfCompany}
    OnFailResolve={<Forwarder to="/#" message="No company found!" />}
  >
    <SensorsMap {...props} />
  </InjectParams>
);
