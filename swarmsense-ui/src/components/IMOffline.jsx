/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
export default /**
 * IMOffline - Handles when the network is down on the client.
 *
 * @param  {Object} props
 * @return {React.Node}
 */

function IMOffline(props) {
  return (
    <div
      style={{
        backgroundImage: "url(./images/keep-calm.png)",
        backgroundPosition: "50% 50%",
        backgroundRepeat: "no-repeat",
        height: "100vh",
        backgroundColor: "rgb(0, 188, 212)"
      }}
    />
  );
}
