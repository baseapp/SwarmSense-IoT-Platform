/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import PropTypes from "prop-types";

function WidgetText({
  value,
  unit,
  style = {},
  labelTrue,
  labelFalse,
  online
}) {
  value = value ? Math.round(value * 100) / 100 : "n/v";
  if (value && labelTrue) {
    value = labelTrue;
  } else if (!value && labelFalse) {
    value = labelFalse;
  }
  return (
    <div
      style={{
        ...style,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <div
        style={{
          fontSize: labelTrue && labelFalse ? "1.2rem" : "1.8rem",
          color: online ? "rgb(0, 188, 250)" : "grey"
        }}
      >
        {value}
      </div>
      {unit && (
        <span style={{ fontSize: "0.8rem", color: "grey" }}>{unit}</span>
      )}
    </div>
  );
}
WidgetText.propTypes = {
  online: PropTypes.bool,
  labelTrue: PropTypes.string,
  labelFalse: PropTypes.string,
  value: PropTypes.string.isRequired, // Value of the parameter to display
  unit: PropTypes.string, // unit of the value
  style: PropTypes.object // style props passsed to the element.
};
export default WidgetText;
