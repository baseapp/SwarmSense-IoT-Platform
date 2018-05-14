/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
 
export const set_current_user = userInfo => {
  return { type: "SET_CURRENT_USER", payload: userInfo };
};
export const set_meta_data = metaData => {
  return { type: "SET_META_DATA", payload: metaData };
};
export const set_login_as = userInfo => {
  return { type: "SET_LOGIN_AS", payload: userInfo };
};
export const set_configuring = bool => {
  return { type: "SET_CONFIGURING", payload: bool };
};
export const set_websettings = webSettings => {
  return { type: "SET_WEBSETTINGS", payload: webSettings };
};
export const select_company = company => {
  return { type: "SELECT_COMPANY", payload: company };
};
export const set_postLoginInitials = initials => {
  return { type: "SET_POST_LOGIN_INITIALS", payload: initials };
};
export const generic_set = payload => {
  return { type: "GENERIC_SET", payload: payload };
};
