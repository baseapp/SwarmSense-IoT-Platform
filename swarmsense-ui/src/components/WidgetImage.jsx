/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import PropTypes from "prop-types";
import { get_logger } from "../utils";
const WidgetImage = ({ time, src, alt }) => {
  let local_time_ob = new Date(time),
    logger = get_logger("WidgetImage"),
    local_time = local_time_ob.toLocaleTimeString();
  // logger(
  //   "@render, new Date(time),(new Date(time)).toLocaleTimeString()",
  //   time,
  //   local_time_ob,
  //   local_time
  // );
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <img src={src} alt={alt} style={{ width: "80%", height: "80%" }} />
      <span>{local_time}</span>
    </div>
  );
};
WidgetImage.propTypes = {
  src: PropTypes.string,
  time: PropTypes.string,
  alt: PropTypes.string
};
export default WidgetImage;
