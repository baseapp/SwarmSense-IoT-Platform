/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import { CreateNetworkSensors as NetworkSensorsCreate } from "./index";

export default /**
 * @name CreateNetworkAlert
 * @description A component to create the network alerts
 * @example <CreateNetworkAlert/>
 */
props => <NetworkSensorsCreate {...props} network_alerts={true} />;
