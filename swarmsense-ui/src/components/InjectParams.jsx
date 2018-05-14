/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import PropTypes from "prop-types";
import { get_params, set_params } from "../utils";
import Forwarder from "./Forwarder";

/**
 * InjectParams - A component which passses objects from sessionStorage.pOb down to the children
 * with optionally checking for certain conditions.
 *
 * @param  {Object} props
 * @return {React.Node}
 */

function InjectParams(props) {
  let { resolve, OnFailResolve, children, ..._props } = props,
    token = sessionStorage.getItem("token");
  if (!token) {
    return <Forwarder to="login" message="Please login to continue" />;
  }
  let render_children = true,
    params = get_params(),
    setParam = (key, value) => {
      set_params(key, value);
      params = get_params();
    };
  if (resolve && OnFailResolve) {
    if (!resolve(params)) {
      render_children = false;
    }
  }
  if (render_children) {
    if (Array.isArray(children)) {
      return children.map((child, id) =>
        React.cloneElement(child, { ...params, setParam, ..._props })
      );
    } else {
      return React.cloneElement(children, { ...params, setParam, ..._props });
    }
  } else {
    return OnFailResolve;
  }
}
InjectParams.propTypes = {
  resolve: PropTypes.func, // will be called to resolve to render children, if given.
  OnFailResolve: PropTypes.element, // if resolve function is given and returns false, this element will be rendered
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element)
  ])
};
export default InjectParams;
