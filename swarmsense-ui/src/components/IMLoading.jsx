/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
export default /**
 * IMLoading - Used for first loading of the application. Shows the #loading-segement
 * and the current stage while setting application settings.
 *
 * @param  {Object} props
 * @return {React.Node}
 */

function IMLoading(props) {
  return (
    <div id="loading-segement">
      <div className="info">
        {props.stage && <span>Currently - {props.stage} </span>}
      </div>
    </div>
  );
}
