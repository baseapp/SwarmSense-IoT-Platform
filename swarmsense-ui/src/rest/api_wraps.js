/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
 
import { rest_client as restClient } from "./index";
import { get_logger } from "../utils";
let logger = get_logger("library/api_wraps", false);

/**
 * getSettings - Requests settings from the endpoint - '/settings_all'
 * @async
 * @return {Promise<Object>} Settings from the api
 * @throws An exception is thrown if the promise is rejected with error.
 */
async function getSettings() {
  try {
    let settings = await restClient("GET_LIST", "settings_all", {});
    return settings;
  } catch (e) {
    throw e;
  }
}

/**
 * getAllNetworkSensors - Requests all the sensors of a network.
 * @async
 * @param {Object} network_info The company and network info for request
 * @param  {string} network_info.cid Company id
 * @param  {string} network_info.nid Network id
 * @return {Promise<Object>} List of all the sensors in the network.
 * @throws An exception is thrown if the promise is rejected with error.
 */

async function getAllNetworkSensors({ cid, nid }) {
  try {
    let network_sensors = await restClient(
      "GET_LIST",
      `companies/${cid}/networks/${nid}/sensors`,
      {}
    );
    // logger(network_sensors);
    return network_sensors;
  } catch (e) {
    throw e;
  }
}

/**
 * getNetworkSensors - Requests list of specific sensors(more control than {@link getAllNetworkSensors})
 * @async
 * @param {Object} api_params Options to control the list of sensors.
 * @param {string} api_params.cid Company id
 * @param {string} api_params.nid Network id
 * @param {Number} [api_params.page=1] The page number to retrieve.
 * @param {Number} [api_params.perPage=20] The number of sensors on each page.
 * @param {string} [api_params.order="ASC"] Sort order for the sensors. Value can be - "ASC" or "DESC"
 * @param {string} [api_params.field="id"] Sort applied on this field of the list. It can be any field in the list of sensors.
 * @return {Promise<Object>} List of specific sensors in a network.
 * @throws An exception is thrown if the promise is rejected with error.
 */

async function getNetworkSensors({
  cid,
  nid,
  page = 1,
  perPage = 20,
  order = "ASC",
  field = "id"
}) {
  try {
    let network_sensors = await restClient(
      "GET_LIST",
      `companies/${cid}/networks/${nid}/sensors`,
      { pagination: { page, perPage }, sort: { order, field } }
    );
    // logger(network_sensors);
    return network_sensors;
  } catch (e) {
    throw e;
  }
}

/**
 * getSensorConfiguration - Request sensor-configuration of a sensor.
 * @async
 * @param {Object} sensor_info An object with sensor information.
 * @param  {string} sensor_info.sensor_id Sensor id
 * @return {Promise<Object>} Sensor configuration for the sensor-id.
 * @throws An exception is thrown if the promise is rejected with error.
 */

async function getSensorConfiguration({ sensor_id }) {
  if (sensor_id) {
    let sensor_configs = await restClient(
      "GET_LIST",
      `sensors/${sensor_id}/configuration`,
      { pagination: { page: 1, perPage: 1000 }, sort: {} }
    );
    return sensor_configs;
  } else {
    throw new Error("sensor-id is not defined!");
  }
}

/**
 * setSensorConfiguration - It saves the configuration of a sensor to the backend.
 * @async
 * @param {object} sensor_info Sensor info for the backend request.
 * @param  {string} sensor_info.sensor_id Sensor id
 * @param  {string} sensor_info.key         Configuration key for which value is to be set.
 * @param  {string} sensor_info.value     Value for the configuration key.
 * @return {Promise<Object>} Response from the server.
 * @throws An exception is thrown if the promise is rejected with error.
 */

async function setSensorConfiguration({ sensor_id, key, value }) {
  if (sensor_id && key) {
    let data = {};
    data[key] = value;
    let confirm = await restClient(
      "UPDATE",
      `sensors/${sensor_id}/configuration`,
      { data }
    );
    return confirm;
  } else {
    throw new Error("sensor-id/key is/are not defined!");
  }
}

/**
 * deleteWidget - Deletes a widget from a dashboard
 * @async
 * @throws An exception is thrown if the promise is rejected with error.
 * @param {Object} widget_info Widget information
 * @param  {string} widget_info.cid Company id
 * @param  {string} widget_info.dashboard_id Dashboard id
 * @param  {string} widget_info.widget_id Widget id
 * @return {Promise<Object>} Response from the server.
 */

async function deleteWidget({ cid, dashboard_id, widget_id }) {
  if (cid && dashboard_id && widget_id) {
    let result = await restClient(
      "DELETE",
      `companies/${cid}/dashboards/${dashboard_id}/widgets`,
      { id: widget_id }
    );
    return result;
  } else {
    throw new Error("cid/dashboard_id/widget_id is/are not defined!");
  }
}

/**
 * updateWidget - Updates a widget
 * @async
 * @throws An exception is thrown if the promise is rejected with error.
 * @param {Object} widget_info Widget information
 * @param  {string} widget_info.cid Company id
 * @param  {string} widget_info.dashboard_id Dashboard id
 * @param  {string} widget_info.widget_id Widget id
 * @param {Object} widget_info.data The data to save for this widget.
 * @return {Promise<Object>} Response from the server.
 */

async function updateWidget({ cid, dashboard_id, widget_id, data }) {
  if (cid && dashboard_id && widget_id && data) {
    return await restClient(
      "UPDATE",
      `companies/${cid}/dashboards/${dashboard_id}/widgets`,
      { id: widget_id, data: { data } }
    );
  } else {
    throw new Error("cid/dashboard_id/widget_id/data is/are undefined!");
  }
}

/**
 * getWidget - Get information of a widget in a dashboard
 *
 * @async
 * @throws An exception is thrown if the promise is rejected with error.
 * @param {Object} widget_info Widget information
 * @param  {string} widget_info.cid Company id
 * @param  {string} widget_info.dashboard_id Dashboard id
 * @param  {string} widget_info.widget_id Widget id
 * @return {Promise<Object>} Widget information.
 */

async function getWidget({ cid, dashboard_id, widget_id }) {
  if (cid && dashboard_id) {
    let result = await restClient(
      "GET_ONE",
      `companies/${cid}/dashboards/${dashboard_id}/widgets`,
      { id: widget_id }
    );
    return result;
  } else {
    throw new Error("cid/dashboard_id/widget_id is undefined!");
  }
}
/**
 * getWidgets - Get the list of widgets in a dashboard
 *
 * @async
 * @throws An exception is thrown if the promise is rejected with error.
 * @param {Object} widget_info Widget information
 * @param {string} widget_info.cid Company id
 * @param {string} widget_info.dashboard_id Dashboard id
 * @param {Number} [widget_info.page=1] The page number to retrieve.
 * @param {Number} [widget_info.perPage=20] The number of sensors on each page.
 * @param {string} [widget_info.order="ASC"] Sort order for the sensors. Value can be - "ASC" or "DESC"
 * @param {string} [widget_info.field="id"] Sort applied on this field of the list. It can be any field in the list of sensors.
 * @return {Promise<Object>} List of widgets in a dashboard.
 */
async function getWidgets({
  cid,
  dashboard_id,
  page = 1,
  perPage = 20,
  order = "ASC",
  field = "id"
}) {
  let params = {
    pagination: { page, perPage },
    sort: { order, field }
  };
  if (cid && dashboard_id) {
    let result = await restClient(
      "GET_LIST",
      `companies/${cid}/dashboards/${dashboard_id}/widgets`,
      params
    );
    return result;
  } else {
    throw new Error("cid/dashboard_id is undefined!");
  }
}

/**
 * addWidget - Add a widget to a dashboard
 * @async
 * @throws An exception is thrown if the promise is rejected with error.
 * @param {Object} widget_info Widget information
 * @param {string} widget_info.cid Company id
 * @param {string} widget_info.dashboard_id Dashboard id
 * @param  {type} widget_info.data Data to add, for the widget.
 * @return {Promise<Object>} Response from the server
 */

async function addWidget({ cid, dashboard_id, data }) {
  if (cid && dashboard_id && data) {
    let result = await restClient(
      "CREATE",
      `companies/${cid}/dashboards/${dashboard_id}/widgets`,
      { data }
    );
    return result;
  } else {
    throw new Error("cid/dashboard_id/data is undefined");
  }
}

/**
 * updateDashboard - Updates the dashboard.
 * @async
 * @throws An exception is thrown if the promise is rejected with error.
 * @param {Object} dashboard_info Dashboard information
 * @param  {string} dashboard_info.cid        Company id
 * @param  {string} dashboard_info.dashboard_id Dashboard id
 * @param  {Object} dashboard_info.data Dashboard data to be saved.
 * @return {Promise<Object>} Response from the server.
 */

async function updateDashboard({ cid, dashboard_id, data }) {
  if (cid && dashboard_id && data) {
    let result = await restClient("UPDATE", `companies/${cid}/dashboards`, {
      id: dashboard_id,
      data
    });
    return result;
  } else {
    throw new Error("cid/dashboard/data is undefined!");
  }
}

/**
 * deleteDashboard - Deletes a dashboard
 * @async
 * @throws An exception is thrown if the promise is rejected with error.
 * @param {Object} dashboard_info Dashboard information
 * @param  {string} dashboard_info.cid        Company id
 * @param  {string} dashboard_info.dashboard_id Dashboard id
 * @return {Promise<Object>}                Response from server.
 */

async function deleteDashboard({ cid, dashboard_id }) {
  logger(cid, dashboard_id);
  if (cid && dashboard_id) {
    let result = await restClient("DELETE", `companies/${cid}/dashboards`, {
      id: dashboard_id
    });
    return result;
  } else {
    throw new Error("cid/dashboard_id is not defined!");
  }
}

/**
 * addDashboard - Adds a dashboard
 * @async
 * @throws An exception is thrown if the promise is rejected with error.
 * @param {Object} dashboard_info Dashboard information
 * @param  {string} dashboard_info.cid        Company id
 * @param {Object} dashboard_info.data Daashboard data to be saved.
 * @return {Promise<Object>}        Response from the server
 */

async function addDashboard({ cid, data }) {
  if (cid && data) {
    let result = await restClient("CREATE", `companies/${cid}/dashboards`, {
      data
    });
    return result;
  } else {
    throw new Error("cid/data is undefined");
  }
}

/**
 * getCustomDashboard - Get a custom dashboard from the backend.
 * @async
 * @throws An exception is thrown if the promise is rejected with error.
 * @param {Object} dashboard_info Dashboard information
 * @param  {string} dashboard_info.cid        Company id
 * @return {Promise<Object>} Dashboard data from the backend.
 */

async function getCustomDashboard({ cid, dashboard_id }) {
  if (dashboard_id && cid) {
    let results = restClient("GET_ONE", `companies/${cid}/dashboards`, {
      id: dashboard_id
    });
    return results;
  } else {
    return Promise.reject(
      "Dashboard_id and/or company-id not provided to the getSensorInfo call."
    );
  }
}

/**
 * getDashboards - Get the list of custom dashboards in a company.
 *
 * @async
 * @throws An exception is thrown if the promise is rejected with error.
 * @param {Object} dashboard_info Widget information
 * @param {string} dashboard_info.cid Company id
 * @param {Number} [dashboard_info.page=1] The page number to retrieve.
 * @param {Number} [dashboard_info.perPage=10] The number of sensors on each page.
 * @param {string} [dashboard_info.order="ASC"] Sort order for the sensors. Value can be - "ASC" or "DESC"
 * @param {string} [dashboard_info.field="id"] Sort applied on this field of the list. It can be any field in the list of sensors.
 * @return {Promise<Object>} List of custom dashboards in a company.
 */
async function getDashboards({
  cid,
  page = 1,
  perPage = 10,
  order = "ASC",
  field = "id",
  sensorType = undefined
}) {
  let params = {
    pagination: { page, perPage },
    sort: { order, field }
  };
  if (sensorType) {
    params.filter = { sensor_type: sensorType };
  }
  if (cid) {
    let results = await restClient(
      "GET_LIST",
      `companies/${cid}/dashboards`,
      params
    );
    return results;
  } else {
    throw new Error("cid is undefined");
  }
}
/**
 * getSensors - Get the list of sensors in a company.
 *
 * @async
 * @throws An exception is thrown if the promise is rejected with error.
 * @param {Object} sensor_info Widget information
 * @param {string} sensor_info.cid Company id
 * @param {Number} [sensor_info.page=1] The page number to retrieve.
 * @param {Number} [sensor_info.perPage=10] The number of sensors on each page.
 * @param {string} [sensor_info.order="ASC"] Sort order for the sensors. Value can be - "ASC" or "DESC"
 * @param {string} [sensor_info.field="id"] Sort applied on this field of the list. It can be any field in the list of sensors.
 * @param {string} [sensor_info.name=null] Name of the sensor to search for.
 * @return {Promise<Object>} List of sensors in a company.
 */
async function getSensors({
  cid,
  page = 1,
  perPage = 10,
  order = "ASC",
  field = "id",
  name = null,
  type_id = null,
  type = null
}) {
  let params = {
    pagination: { page, perPage },
    sort: { order, field }
  };
  if (name) {
    params.filter = { q: name };
  }
  if (cid) {
    if (type_id) {
      return restClient("GET_ONE", `sensor_types`, { id: type_id })
        .then(({ data: { type } }) => type)
        .then(type =>
          restClient(
            "GET_LIST",
            `companies/${cid}/sensors_by_type/${type}`,
            params
          )
        );
    } else if (type) {
      return restClient(
        "GET_LIST",
        `companies/${cid}/sensors_by_type/${type}`,
        params
      );
    } else {
      return restClient("GET_LIST", `companies/${cid}/sensors`, params);
    }
  } else {
    return Promise.reject("company id is not defined!");
  }
}

/**
 * getSensorHistory - Get the list of values over time of a sensor.
 *
 * @async
 * @throws An exception is thrown if the promise is rejected with error.
 * @param {Object} [sensor_info={}] Widget information
 * @param {string} sensor_info.cid Company id
 * @param {string} sensor_info.sid Sensor id
 * @param {Date} [sensor_info.from] Sensor values starting from this time.
 * @param {Date} [sensor_info.to] Sensor values till this time.
 * @param {Number} [sensor_info.page=1] The page number to retrieve.
 * @param {Number} [sensor_info.perPage=10] The number of sensors on each page.
 * @param {Number} [sensor_info.maxPoints=200] Maximum number of values to query.
 * @param {boolean} [sensor_info.group_by_fields=false] After the response is received, whether to group sensors according to fields(and sorted by order field).
 * @param {Number} [sensor_info.duration = null] Query values of certain milliseconds duration.
 * @param {Array} [fields=[]] If specified, this function returns values of specified fields only.
 * @return {Promise<Object>} List of sensors in a company.
 */
async function getSensorHistory(
  {
    cid,
    sid,
    from,
    to,
    page,
    perPage,
    maxPoints = 200,
    group_by_fields = false,
    duration = null,
    created_at = ""
  } = {},
  fields = []
) {
  if (!cid || !sid) {
    return Promise.reject(
      "Sensor-id and/or company-id is not provided to the getSensorHistory call."
    );
  }
  try {
    if (!created_at) {
      let sensor_info = await getSensorInfo({ cid, sid });
      created_at = sensor_info.created_at;
    }
    created_at = new Date(created_at);
    // set default 1 week from today or sensor creation date
    // whichever is legit
    if (!from) {
      if (duration) {
        //duration in milli-seconds
        // logger("@getSensorHistory, duration", duration);
        from = new Date(Date.now() - duration);
      } else {
        from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      }
    }
    let from_diff_created = Date.parse(from) - Date.parse(created_at);
    // console.log(from_diff_created)
    if (from_diff_created < 0) {
      from = created_at;
    }
    // console.log("created_at", created_at, "from", from)
    if (!to) {
      to = new Date();
    }
    let time_difference = Date.parse(to) - Date.parse(from); // time duration in milliseconds
    if (time_difference < 0) {
      // checks if, valid time period
      return Promise.reject("Time period not valid.");
    } else {
      let params = {};
      params.filter = {
        start_date: from.toISOString(),
        end_date: to.toISOString()
      };
      if (page && perPage) {
        params.pagination = { page, perPage };
      } else {
        let _gd = Math.floor(time_difference / 1000 / maxPoints);
        if (_gd !== 0) {
          let group_duration = `${_gd}s`;
          params.pagination = { page: 1, perPage: maxPoints };
          params.filter = { ...params.filter, group_duration };
        }
      }
      let data = await restClient("GET_LIST", `sensors/${sid}/history`, params);
      let sorted_fields = Object.getOwnPropertyNames(data.fields)
        .sort((a, b) => {
          let weight_a = Number.parseInt(data.fields[a]["weight"], 10) || 10;
          let weight_b = Number.parseInt(data.fields[b]["weight"], 10) || 10;
          return weight_b - weight_a;
        })
        .map(n => data.fields[n]);
      if (fields.length >= 1) {
        let new_data = [];
        data.data.map(record => {
          let filtered_record = {};
          fields.map(f => {
            // console.log(f, "field")
            if (!isNaN(record[f]) || typeof record[f] === "string") {
              filtered_record[f] = record[f];
            } else if (
              !isNaN(record[`mean_${f}`]) ||
              typeof record[`mean_${f}`] === "string"
            ) {
              filtered_record[f] = record[`mean_${f}`];
            } else {
              filtered_record[f] = null;
            }
            return null;
          });
          filtered_record.id = record.id;
          filtered_record.time = record.time;
          new_data.push(filtered_record);
          return null;
        });
        let new_fields = {};
        fields.map(f => {
          new_fields[f] = data.fields[f];
        });
        data.fields = new_fields;
        data.data = new_data;
      }
      if (group_by_fields) {
        //sorted fields according to weight and pointed by field-name
        let new_data = {};
        data.data.map(record => {
          Object.getOwnPropertyNames(data.fields).map(f => {
            if (!new_data[f]) {
              new_data[f] = [];
            }
            let field_record = {};
            field_record.time = record.time;
            field_record.id = record.id;
            field_record[f] = record[f];
            new_data[f].push(field_record);
            return null;
          });
          return null;
        });
        data.data = new_data;
      }
      return { ...data, sensor_id: sid, sorted_fields };
    }
  } catch (err) {
    throw err;
  }
}

/**
 * getSensorsHistory - Get list of sensor values over a time of many sensors
 *
 * @param  {Array} sensors_info The array having sensor_info (see - {@link getSensorHistory}) for each sensor.
 * @param  {Array} [fields = []] Results with only specified fields here.
 * @return {Promise<Object>} List of all the sensors' value over a specified timeline as specified.
 */

async function getSensorsHistory(sensors_info, fields = []) {
  // sensor_info is an array of objects with shape same as the input of the getSensorHistory
  // console.log(fields)
  return await Promise.all(
    sensors_info.map(async sensor_info => {
      let history = await getSensorHistory(sensor_info, fields);
      return history;
    })
  );
}

/**
 * getSensorDataTypes - Request sensor-data-types.
 *
 * @return {Promise}  List of sensor-data-types.
 */

async function getSensorDataTypes() {
  let data = await restClient("GET_LIST", `sensor_data_types`, {}).then(
    ({ data }) => data
  );
  return data;
}

/**
 * getSensorInfo - Sensor information of a sensor.
 * @param {Object} sensor_info Sensor information
 * @param  {string} cid Company id
 * @param  {string} sid Sensor id
 * @return {Promise} Sensor data from the server.
 */

async function getSensorInfo({ cid, sid }) {
  if (sid && cid) {
    return restClient("GET_ONE", `companies/${cid}/sensors`, { id: sid }).then(
      ({ data }) => data
    );
  } else {
    return Promise.reject(
      "sensor-id and/or company-id not provided to the getSensorInfo call."
    );
  }
}

/**
 * getAlertHistory - Requests list of alert events over time (alert-history)
 * @async
 * @throws An exception is thrown if the promise is rejected with error.
 * @param {Object} company_info company_information
 * @param  {string} company_info.cid Company id
 * @param  {Object} company_info.sort  Refer to parameters of {@link restClient}
 * @param  {Object} company_info.filter      Refer to parameters of {@link restClient}
 * @param  {Object} company_info.pagination  Refer to parameters of {@link restClient}
 * @return {Promise}  List of alerts over time.
 */

async function getAlertHistory({ cid, sort, filter, pagination } = {}) {
  let params = {};
  if (!pagination) {
    params.pagination = { page: 1, perPage: 10 };
  } else {
    params.pagination = pagination;
  }
  if (filter) {
    params.filter = filter;
  }
  if (sort) {
    params.sort = sort;
  }
  let url = `company_alert_history`;
  if (cid) {
    url = `companies/${cid}/alert_history`;
  }
  try {
    let data = await restClient("GET_LIST", url, params);
    return data;
  } catch (err) {
    throw err;
  }
}

/**
 * getDashboard - Requests the home dashboard of the company.
 * @async
 * @throws An exception is thrown if the promise is rejected with error.
 * @param {Object} company_info Company information
 * @param  {string} company_info.cid Company id
 * @param  {Object} company_info.params Parameters to pass to {@link restClient}
 * @return {Promise} Dashboard info from the server.
 */

async function getDashboard({ cid, params = {} } = {}) {
  try {
    let url;
    if (cid) {
      url = `companies/${cid}/dashboard`;
    } else {
      throw new Error("Company-id is not set in getDashboard");
    }
    let data = await restClient("GET_LIST", url, params);
    return data;
  } catch (err) {
    throw err;
  }
}

/**
 * getStats - Requests the company statistics from endpoint - "/companies/:cid/stats"
 * @async
 * @throws An exception is thrown if the promise is rejected with error.
 * @param {Object} company_info Company information
 * @param  {string} company_info.cid Company id
 * @param  {Object} company_info.params Parameters to pass to {@link restClient}
 * @return {Promise} List of company stats.
 */

async function getStats({ cid, params = {} } = {}) {
  try {
    if (!cid) {
      throw new Error("Company-id is not set in getStats");
    } else {
      let data = await restClient("GET_LIST", `companies/${cid}/stats`, params);
      return data;
    }
  } catch (err) {
    throw err;
  }
}

/**
 * getAllSensorTypes - Requests sensor types from the backend
 * @async
 * @throws An exception is thrown if the promise is rejected with error.
 * @return {Promise} List of all the sensor types.
 */

async function getAllSensorTypes() {
  try {
    let sensor_types = await restClient("GET_ONE", "sensor_types_all", {}).then(
      ({ data }) => data
    );
    return sensor_types;
  } catch (err) {
    throw err;
  }
}

/**
 * Gets the current user information from the api
 * @returns {Promise} resolve into the current user info
 */
async function getCurrentUser() {
  return restClient("GET_ONE", "me", {}).then(({ data }) => {
    return Promise.resolve(data);
  });
}

async function setCurrentUser(data) {
  return restClient("CREATE", "me", { data: data });
}

/**
 * set_one_meta_data - sets one key and value in metadata.
 * @param {Object} meta_data The meta-data information.
 * @param  {string} meta_data.key Key of the metadata.
 * @param  {string} meta_data.value Value of the metadata.
 * @return {Promise} Response from the server.
 */

async function set_one_meta_data({ key, value }) {
  return restClient("CREATE", "me/meta_data", { data: { key, value } });
}
/**
 * setMetaData - Saves the metadata(many key-values) information of the current user.
 * @async
 * @param  {Object} data Metadata info to save
 * @return {Promise}      Response from the server
 */

async function setMetaData(data) {
  return Promise.all(data.map(d => set_one_meta_data(d)));
}

/**
 * @async
 * Gets the current user's metadata from the api
 * @returns {Promise} Promise to resolve into the user meta data
 */
async function getMetadata() {
  return restClient("GET_ONE", "me/meta_data", {
    pagination: {},
    sort: {}
  }).then(json => {
    let meta_data = {};
    json.data.map(ob => {
      meta_data[ob["key"]] = ob["value"];
      return null;
    });
    return Promise.resolve(meta_data);
  });
}

function getCompanies() {
  return restClient("GET_LIST", "companies", {});
}

/**
 * getGlobalCompany - Get the company details for the company id passed as an argument.
 * @async
 * @param  {string} [default_company_id = null] Company id
 * @return {Promise} Company details.
 */

async function getGlobalCompany(default_company_id = null) {
  /**
  Gets the default_company for the current user session
  @returns {Promise} Promise to resolve into global company assigned to the current user
  */
  // get the global company
  let request_type = "GET_LIST";
  let params = {
    pagination: { page: 1, perPage: 1 },
    sort: { order: "DESC", field: "id" }
  };
  let id = default_company_id;
  if (id) {
    // if the default company id is set
    request_type = "GET_ONE";
    params = { id: id };
  }
  if (default_company_id) {
    try {
      let { data } = await restClient("GET_ONE", "companies", {
        id: default_company_id
      });
      return Promise.resolve(data);
    } catch (err) {
      if (err.code === 404) {
        // company not found
        try {
          let { data: [first_company] } = await getCompanies();
          if (!first_company) {
            return Promise.reject("No companies assigned to you!");
          } else {
            return Promise.resolve(first_company);
          }
        } catch (err) {
          return Promise.reject(err);
        }
      } else {
        return Promise.reject(err);
      }
    }
  } else {
    try {
      let { data: [first_company] } = await getCompanies();
      if (!first_company) {
        return Promise.reject("No companies found!");
      } else {
        return Promise.resolve(first_company);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

export {
  getSensorInfo,
  getSensorHistory,
  getAlertHistory,
  getDashboard,
  getStats,
  getAllSensorTypes,
  getSensorsHistory,
  getSensorDataTypes,
  getMetadata,
  getGlobalCompany,
  getCurrentUser,
  setCurrentUser,
  setMetaData,
  getSensors,
  deleteWidget,
  updateWidget,
  getWidget,
  getWidgets,
  addWidget,
  updateDashboard,
  deleteDashboard,
  addDashboard,
  getCustomDashboard,
  getDashboards,
  getSensorConfiguration,
  setSensorConfiguration,
  getNetworkSensors,
  getAllNetworkSensors,
  getSettings,
  getCompanies
};
