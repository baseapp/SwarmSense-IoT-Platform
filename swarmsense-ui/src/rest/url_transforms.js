/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
 
import { get_params } from "../utils";

let url_transforms = {
  me: { url: "me", parameters: [] },
  my_meta_data: { url: "me/meta_data", parameters: [] },
  login: { url: "login", parameters: [] },
  signup: { url: "signup", parameters: [] },
  "forgot-password": { url: "forgot-password", parameters: [] },
  "reset-password": { url: "reset-password", parameters: [] },
  users: { url: "users", parameters: [] },
  settings: { url: "settings", parameters: [] },
  settings_all: { url: "settings_all", parameters: [] },
  sensor_types: { url: "sensor_types", parameters: [] },
  sensor_types_all: { url: "sensor_types_all", parameters: [] },
  sensor_data_types: { url: "sensor_data_types", parameters: [] },
  companies: { url: "companies", parameters: [] },
  company_users: { url: `companies/cid/users`, parameters: ["cid"] },
  company_sensors: { url: `companies/cid/sensors`, parameters: ["cid"] },
  sensors_map: { url: `companies/cid/sensors`, parameters: ["cid"] }, // alias
  company_sensors_by_type: {
    url: `companies/cid/sensors_by_type/stype`,
    parameters: ["cid", "stype"]
  },
  sensors_type_map: {
    url: `companies/cid/sensors_by_type/stype`,
    parameters: ["cid", "stype"]
  }, //alias for the sensors by type map
  sensor_configuration: {
    url: `sensors/sid/configuration`,
    parameters: ["sid"]
  },
  my_dashboards: { url: `companies/cid/dashboards`, parameters: ["cid"] },
  sensor_values: { url: `sensors/sid/values`, parameters: ["sid"] },
  sensor_alerts: { url: `sensors/sid/alerts`, parameters: ["sid"] },
  sensor_history: { url: `sensors/sid/history`, parameters: ["sid"] },
  sensor_chart: { url: `sensors/sid/history`, parameters: ["sid"] },
  sensor_export: { url: `sensors/sid/export`, parameters: ["sid"] },
  company_alerts: { url: `companies/cid/alerts`, parameters: ["cid"] },
  company_alert_history: {
    url: `companies/cid/alert_history`,
    parameters: ["cid"]
  },
  company_networks: { url: `companies/cid/networks`, parameters: ["cid"] },
  company_network_sensors: {
    url: `companies/cid/networks/nid/sensors`,
    parameters: ["cid", "nid"]
  },
  network_sensors_map: {
    url: `companies/cid/networks/nid/sensors`,
    parameters: ["cid", "nid"]
  },
  company_network_alerts: {
    url: `companies/cid/networks/nid/alerts`,
    parameters: ["cid", "nid"]
  },
  alert_history: {
    url: `companies/cid/alert_history`,
    parameters: ["cid"]
  },
  events_log: {
    url: `companies/cid/dashboard`,
    parameters: ["cid"]
  },
  events: {
    // scheduler related event
    url: "companies/cid/events",
    parameters: ["cid"]
  },
  events_history: {
    url: "companies/cid/event_history",
    parameters: ["cid"]
  },
  sensor_events: {
    url: "sensors/sid/events",
    parameters: ["sid"]
  },
  firmwares: {
    url: "ota/firmwares",
    parameters: []
  }
};

/**
 * @name transformer
 * @description Transforms a frontend url such as "alert_history", etc.
 * into backend urls with proper values of the parameters.
 * @param {string} resource the string representing resource such as alert_history
 * @returns {string} the string representing specific backend resource such as companies/12/alert_history
 * @example
 * let api_url = transformer(alert_history) //proper parameters are set and api endpoint is http://www.xyz.com
 * // api_url = "http://www.xyz.com/companies/12/alert_history"
 */
let transformer = resource => {
  if (url_transforms[resource]) {
    let _e = url_transforms[resource];
    if (_e.parameters.length > 0) {
      let transformed_resource = "";
      let params = {},
        {
          global_company: { id: cid } = { id: undefined },
          sensor: { id: sid } = { id: undefined },
          sensor_type: { type: stype } = { id: undefined },
          network: { id: nid } = { id: undefined }
        } = get_params();
      // console.log("transformer-get-params", get_params());
      // console.log("cid", cid);
      params.cid = cid;
      params.sid = sid;
      params.stype = stype;
      params.nid = nid;
      // console.log("transformer-params", params);
      transformed_resource = _e.url
        .split("/")
        .map(placeholder => {
          if (params[placeholder]) {
            return params[placeholder];
          } else {
            return placeholder;
          }
        })
        .join("/");
      return transformed_resource;
    } else {
      return _e.url;
    }
  } else {
    return resource;
  }
};
export { transformer };
