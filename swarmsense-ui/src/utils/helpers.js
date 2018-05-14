/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
 
import moment from "moment";
import {
  getCurrentUser,
  getMetadata,
  getGlobalCompany,
  rest_client as restClient
} from "../rest";

const debug_mode = true;
/**
 * It defines build_version, change_logs and build_on properties under window.application
 * @arg {Object} dev_info The dev information to add.
 * @arg {string} dev_info.build_version The version of the current system.
 * @arg {Array} dev_info.change_logs An array of strings indicating summary of change logs.
 * @arg {string} dev_info.build_on A string to indicate last built time.
 */
function set_developer_info({ build_version, change_logs, build_on }) {
  Object.defineProperty(window.application, "build_version", {
    value: build_version,
    writable: false,
    configurable: false
  });
  Object.defineProperty(window.application, "change_logs", {
    value: change_logs,
    writable: false,
    configurable: false
  });
  Object.defineProperty(window.application, "build_on", {
    value: build_on,
    writable: false,
    configurable: false
  });
}
/**
 * It returns a logging function.
 * @arg {string} [context='logger'] It describes the context for the logger.
 * @arg {boolean} [switch_off=false] It controls the logging of current context.
 * @returns {function} A function that takes a string to log
 * @example
 * // returns a logger function
 * let logger = get_logger("example_namespace")
 * // get_logger("example_namespace", true) : this will switch off printing logs of context example_namespace.
 * // use the logger in this context.
 * logger("doodle") // will print "doodle", if debug_mode is on.
 * let v = 10
 * logger("ruler", v) // will print "ruler" and 10, if debug_mode is on.
 */
function get_logger(context = "logger", switch_off = false) {
  /**
   * A logger function based on the context in {@link get_logger} function. Takes any number of inputs.
   */
  function logger() {
    if (debug_mode && !switch_off) {
      console.log(
        `-----------------------Logger:${context}---------------------`
      );
      for (let i = 0; i < arguments.length; i++) {
        if (typeof arguments[i] === "object") {
          console.dir(arguments[i]);
        } else {
          console.log(`${arguments[i]}`);
        }
      }
      console.log(
        `----------------------------Logger---------------------------`
      );
    }
  }
  return logger;
}
let log = get_logger("library/helpers", true);
/**
 * get all the required information for the current user session from the api
 * @name get_post_login_initials
 * @returns {Promise} Promise to resolve into the object with all the user
 * settings as properties - current_user, meta_data & global_company
 */
async function getPostLoginInitials() {
  let postLoginInitials = {};
  postLoginInitials.current_user = await getCurrentUser();
  postLoginInitials.meta_data = await getMetadata();
  postLoginInitials.global_company = await getGlobalCompany(
    postLoginInitials.meta_data.default_company_id
  );
  return postLoginInitials;
}
/**
Calculates the time difference from now
@param {Date} time DateTime object representing time to calculate time difference
@returns {string} string stating time difference between current time and input time
*/
function moments_ago(time) {
  if (!time) {
    return "never updated";
  }
  return moment(time).fromNow();
}
/**
 * A function to clear the sessionStorage & localStorage.
 */
function logout() {
  sessionStorage.clear();
  localStorage.clear();
  window.onunload = null;
  // window.location.reload()
}

/**
@function make_query
@description a utility to make query of the api based url on the basis of
parameters such as filter, page, etc.
@param {object} params parameters to build the url query
@param {object} params.filter represents filter key in the url query
@param {string|Integer} params.page represents the current page to show in the view
@param {string|Integer} params.perPage represents the number of records per page in the view
@param {string} params.order represents the sorting order of the records
@param {string} params.sort represents the property to sort
@returns {string} url query
@example
let query = make_query({filter:{q:"pokemon"},page:1, perPage:23})
//query's value will be "filter={'q':'pokemon'}&page=1&perPage=23&sort=id&order=DESC"
*/
function make_query({
  filter = {},
  page = "1",
  perPage = "25",
  order = "DESC",
  sort = "id"
} = {}) {
  let query = `filter=${JSON.stringify(
    filter
  )}&page=${page}&perPage=${perPage}&order=${order}&sort=${sort}`;
  return query;
}
/**
 * a utility function to extract the filter parameter from the url search query
 * in the form of an object
 * @param {string} query the query string from the url including "?"
 * @return {Object|null} Object holding the parsed filter from the url query, if any
 */
function get_filter(q) {
  // q is the search query in the url
  let _q = parse_query(q); // get the query array
  _q = _q.filter(ob => ob.hasOwnProperty("filter")); // search it for the filter object
  if (_q.length > 0) {
    // console.log(_q[0].filter)
    return _q[0].filter; // return the object with key name 'filter'
  } else {
    return null; // no filter found
  }
}
/**
 * a utility to parse query in the url(followed by '?' in the url) and extract the
 * parameters in the form of an object with property as parameter name and value as
 * the parameter value for each parameter in the url. 'filter' parameter's is also
 * parsed as JSON resulting in filter key pointing to a parsed JSON object.
 * @param {string} query the query part from the url including "?"
 * @returns {Object} url query parsed into the object with key same as the query keys
 */
function parse_query(q) {
  // q is the search query in the url ex. "?hello=world", etc.
  try {
    let _q = q
      .split("?")[1]
      .split("&")
      .map(ob => decodeURIComponent(ob))
      .map(ob => {
        let _ob = ob.split("=");
        let __ob = {};
        if (_ob[0] === "filter") {
          try {
            __ob[_ob[0]] = JSON.parse(_ob[1]);
          } catch (err) {
            console.log("filter is not an apt JSON");
            return [];
          }
        } else {
          __ob[_ob[0]] = _ob[1];
        }
        return __ob;
      });
    return _q || [];
  } catch (err) {
    return [];
  }
}
/**
 * A utility to set the parameters for the api requests
 * processed in restClient. 'uid' represents the resource name to which an
 * endpoint is mapped, where 'params' will be used to request the resource
 * from the api.
 * @param {string} key the name of the key to change
 * @param {Object} params the parameters to be stored
 */
function set_params(key, params) {
  log("setting params", key, params);
  const param_keys = [
    "global_company",
    "sensor",
    "sensor_type",
    "network",
    "sensors",
    "params",
    "multiple",
    "company",
    "alert",
    "user",
    "cdashboard",
    "event",
    "setting",
    "alert",
    "graph_sensor_history"
  ];
  log("param-keys-mandation", param_keys.includes(key));
  if (param_keys.includes(key)) {
    let _p = get_params();
    _p[key] = params;
    // console.log(_p, "new params");
    let new_params = JSON.stringify(_p);
    sessionStorage.setItem("pOb", new_params);
  }
  log("sessionStorage", sessionStorage);
}
/**
@function get_params
@description A utility to get the parameters stored. If 'uid' is null,
whole object is returned, else only the params of 'uid'
@param {string} [key=null] the name of the key to get the value of
@returns {Object} all the parameters stored, if no specific resource name is
given or the parameters of the resource name provided as the input
*/
let get_params = (key = null) => {
  let _p = sessionStorage.getItem("pOb");
  let paramObject = JSON.parse(_p);
  if (key) {
    if (paramObject && paramObject[key]) {
      return paramObject[key];
    } else {
      // throw new Error(`parameters for the route ${uid} not found!`)
      return {};
    }
  } else {
    return (
      paramObject || {
        network: {},
        global_company: {},
        sensor: {},
        sensor_type: {}
      }
    );
  }
};

/**
 * It converts an input object into an array. All the properties of the object
 * are found using getOwnPropertyNames and the value pointed by the
 * input_object[propety_name] is pushed into the array.
 * @param {Object} object to convert into array
 * @return {Object[]} Input object transformed into array
 */
function object_to_array(obj) {
  return Object.getOwnPropertyNames(obj).map(name => {
    return { ...obj[name], name: name };
  });
}
/**
 * It is a utility function for attaching 'id' property to the objects in the
 * input array. It is useful while converting the HTTP response from the api into
 * the admin-on-rest apt HTTP response, in which 'id' is a necessity in requests
 * involving 'GET_LIST', etc. verbs.
 * @param {Object[]} arr An array of objects
 * @returns {Object[]} An array of objects with id property
 */
function attach_id(arr) {
  return arr.map((ob, i) => {
    if (!ob.hasOwnProperty("id") || !ob["id"]) {
      ob.id = i;
    }
    return ob;
  });
}
/**
 * It is a utility function to get the token of an user indicated by 'uid', from
 * the api.
 * @param {String} user_id the user-id of the user for which token has to be generated
 * @returns {Promise} Promise to resolve into token of the user_id
 */
function get_token(uid) {
  if (uid) {
    let param = uid;
    return restClient("GET_ONE", `users/${param}/token`, {}).then(json => {
      return Promise.resolve(json.data.token);
    });
  } else {
    return Promise.reject("Invalid user-id");
  }
}
/**
 * It checks for the support of webstorage in the browser.
 * @return {Promise} Either resolves if support is there or rejects.
 */
async function check_support_web_storage() {
  if (typeof Storage === "undefined") {
    return Promise.reject("Web storage not supported");
  } else {
    return Promise.resolve("Web storage supported");
  }
}

/**
 * extract_time - Returns the string of the form 'hh:mm:ss' using the Date instance passed as the argument.
 *
 * @param  {Date} dateob Date instance
 * @return {string}        string in the form of 'hh:mm:ss' indicating time
 */

function extract_time(dateob) {
  //parses the dateob into the time(UTC) string formatted - hh:mm:ss
  if (!dateob) dateob = new Date();
  let x = `${dateob.getUTCHours()}:${dateob.getUTCMinutes()}:${dateob.getUTCSeconds()}`;
  return x;
}

/**
 * parse_time - Parses string passed in the form of 'hh:mm:ss' to Date instance.
 *
 * @param  {string} hh_mm_ss string in the form of 'hh:mm:ss' indicating time
 * @return {Date}  Date instance pointed by the input arg
 */

function parse_time(hh_mm_ss) {
  // hh_mm_ss : time string(UTC) formatted as hh:mm:ss
  // returns the date object
  if (!hh_mm_ss) {
    return {};
  }
  let d = new Date();
  let hms = hh_mm_ss.split(":");
  hms[0] && d.setUTCHours(hms[0]);
  hms[1] && d.setUTCMinutes(hms[1]);
  hms[2] && d.setUTCSeconds(hms[2]);
  return d;
}
function resolveIfCompany(params) {
  return params["global_company"]["id"];
}
function resolveIfNetwork(params) {
  return resolveIfCompany(params) && params["network"]["id"];
}
function resolveIfSensor(params) {
  return resolveIfCompany(params) && params["sensor"]["id"];
}
function resolveIfSensorsAndParams(params) {
  let resolve =
    resolveIfCompany(params) &&
    params["sensors"] &&
    Array.isArray(params["sensors"]) &&
    params["params"] &&
    Array.isArray(params["params"]);
  log("resolveIfSensorsAndParams", resolve);
  return resolve;
}
function resolveIfSensorType(params) {
  return params["sensor_type"]["type"];
}
function resolveIfAlert(params) {
  return params["alert"]["id"];
}

export {
  moments_ago,
  parse_query,
  object_to_array,
  set_params,
  attach_id,
  get_filter,
  make_query,
  get_token,
  get_params,
  logout,
  getCurrentUser,
  getMetadata,
  getGlobalCompany,
  get_logger,
  getPostLoginInitials,
  set_developer_info,
  check_support_web_storage,
  extract_time,
  parse_time,
  resolveIfCompany,
  resolveIfNetwork,
  resolveIfSensor,
  resolveIfSensorsAndParams,
  resolveIfSensorType,
  resolveIfAlert
};
