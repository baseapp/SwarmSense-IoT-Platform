/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
 
import { USER_LOGIN_SUCCESS } from "admin-on-rest";
/**
 * @function post_login_initials_reducer A redux reducer to set the key
 * of postLoginInitials in the redux-state
 * @param {Object} previousState previous values of the postLoginInitials
 * @param {Object} action action object
 * @returns {Object} the new redux-state value for postLoginInitials key
 */
export const post_login_initials_reducer = (
  previousState = {
    current_user: {},
    meta_data: {},
    configuring: false,
    global_company: {}
  },
  action
) => {
  if (action.type === "SET_CURRENT_USER") {
    let nextState = { ...previousState, current_user: action.payload };
    return nextState;
  } else if (action.type === "SET_META_DATA") {
    let nextState = { ...previousState, meta_data: action.payload };
    return nextState;
  } else if (action.type === "SET_WEBSETTINGS") {
    let nextState = { ...previousState, web_settings: action.payload };
    return nextState;
  } else if (action.type === "SET_CONFIGURING") {
    let nextState = { ...previousState, configuring: action.payload };
    return nextState;
  } else if (action.type === "SELECT_COMPANY") {
    let nextState = { ...previousState, global_company: action.payload };
    return nextState;
  } else if (action.type === "SET_POST_LOGIN_INITIALS") {
    return action.payload; // setting the object at once
  } else if (action.type === USER_LOGIN_SUCCESS) {
    return action.payload; // setting the object at once using the authentication scheme
  } else {
    return previousState;
  }
};
