/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import { DeleteNetworkSensors as NetworkSensorsDelete } from "./index";

export default /**
 * @name NetworkAlertsEdit
 * @description A component to delete alerts from the network.
 * @example <NetworkAlertsEdit/>
 */
props => <NetworkSensorsDelete {...props} network_alerts={true} />;
