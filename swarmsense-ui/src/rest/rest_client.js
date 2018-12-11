/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import {
  GET_LIST,
  GET_ONE,
  CREATE,
  UPDATE,
  DELETE,
  GET_MANY,
  GET_MANY_REFERENCE,
  fetchUtils
} from "admin-on-rest";

import { apiUrl as API_URL } from "./urls";

import { object_to_array, attach_id, get_params, get_logger } from "../utils";
import { transformer } from "./url_transforms";

/**
 * It handles the traffic between the app and the backend. For more info - {@link https://marmelab.com/admin-on-rest/Admin.html#restclient|restClient} prop.
 * @param {string} type Request type, e.g GET_LIST
 * @param {string} resource Resource name, e.g. "posts"
 * @param {Object} params Request parameters. Depends on the request type
 * @returns {Promise} the Promise for a REST response
 */
function rest_client(type, resource, params, useToken = true) {
  let logger = get_logger("rest_client", true);
  // logger("rest_client called", type, resource, params, useToken);
  /**
   * @function convertRESTRequestToHTTP Gets the request from the frontend and converts
   * it into the HTTP request for the backend(endpoint)
   * @param {String} type One of the constants appearing at the top if this file, e.g. 'UPDATE'
   * @param {String} resource Name of the resource to fetch, e.g. 'posts'
   * @param {Object} params The REST request params, depending on the type
   * @returns {Object} { url, options } The HTTP request parameters
   */
  const convertRESTRequestToHTTP = (type, resource, params) => {
    // logger("convertRESTRequestToHTTP called", type, resource, params);
    resource = transformer(resource); //get the url from the url_transforms
    let url = "";
    const { queryParameters } = fetchUtils;
    const options = {};
    if (window.location.hash.length <= 25) {
      if (params.pagination) {
        params.pagination = { page: 1, perPage: params.pagination.perPage };
      }
    }
    switch (type) {
      case GET_LIST: {
        const query = {};
        if (params.pagination) {
          const { page, perPage } = params.pagination;
          if (page && perPage) {
            query["range"] = JSON.stringify([
              (page - 1) * perPage,
              page * perPage - 1
            ]);
          } else {
            query["range"] = JSON.stringify([null, null]);
          }
        }
        if (params.sort) {
          const { field, order } = params.sort;
          query.sort = JSON.stringify([field, order]);
        }
        if (params.filter) {
          query.filter = JSON.stringify(params.filter);
        }
        url = `${API_URL}/${resource}?${queryParameters(query)}`;
        break;
      }
      case GET_ONE:
        // logger("GET_ONE", resource);
        if (
          params.hasOwnProperty("id") &&
          params.id &&
          params.id !== "undefined"
        ) {
          url = `${API_URL}/${resource}/${params.id}`;
        } else {
          url = `${API_URL}/${resource}`;
        }
        break;
      case GET_MANY: {
        const query = {
          filter: JSON.stringify({ id: params.ids })
        };
        url = `${API_URL}/${resource}?${queryParameters(query)}`;
        break;
      }
      case GET_MANY_REFERENCE: {
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;
        const query = {
          sort: JSON.stringify([field, order]),
          range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
          filter: JSON.stringify({
            ...params.filter,
            [params.target]: params.id
          })
        };
        url = `${API_URL}/${resource}?${queryParameters(query)}`;
        break;
      }
      case UPDATE:
        if (params.id) url = `${API_URL}/${resource}/${params.id}`;
        else url = `${API_URL}/${resource}`; // for updating without an id to endpoint.
        let _data = params.data;
        if (resource === "sensor_types") {
          let { config_fields: _configf, fields: _fields } = params.data;
          let config_fields = {},
            fields = {};
          if (_configf && _configf.length > 0) {
            _configf.map(ob => {
              config_fields[ob.name] = ob;
              return null;
            });
          }
          if (_fields && _fields.length > 0) {
            _fields.map(ob => {
              fields[ob.name] = ob;
              return null;
            });
          }
          _data = { ..._data, config_fields, fields };
          // console.log(_data)
        }
        options.method = "PUT";
        if (_data && _data["floormap"]) {
          let data = new FormData();
          if (params.data.floormap.length === 1) {
            data.set("floormap", params.data.floormap[0].rawFile);
          }
          data.set("name", params.data.name);
          params = { ...params, data };
          options.body = params.data;
        } else if (
          resource.includes("dashboards") &&
          resource.includes("companies") &&
          !resource.includes("widgets")
        ) {
          _data = {
            ..._data,
            sensor_type: params.data.sensor_type.toString()
          };
          options.body = JSON.stringify(_data);
        } else {
          options.body = JSON.stringify(_data);
        }
        break;
      case CREATE:
        url = `${API_URL}/${resource}`;
        options.method = "POST";
        options.body = JSON.stringify(params.data);
        if (resource === "sensor_types") {
          let { fields, config_fields } = params.data,
            _fields = {},
            _config_fields = {};
          fields.map(ob => {
            _fields[ob.name] = ob;
            return null;
          });
          config_fields.map(ob => {
            _config_fields[ob.name] = ob;
            return null;
          });
          params.data = {
            ...params.data,
            fields: _fields,
            config_fields: _config_fields
          };
        }
        if (
          params["data"] &&
          params["data"]["floormap"] &&
          params["data"]["floormap"].length === 1
        ) {
          let data = new FormData();
          data.set("floormap", params.data.floormap[0].rawFile || null);
          data.set("name", params.data.name);
          params = { ...params, data };
          options.body = params.data;
        } else if (
            params["data"] &&
            params["data"]["firmware"] &&
            params["data"]["firmware"].length === 1
        ) {
            // Create Firmware, Send Multipart form request
            let data = new FormData();
            data.set("firmware", params.data.firmware[0].rawFile || null);
            data.set("name", params.data.name);
            data.set("version", params.data.version);
            data.set("test_sensors", params.data.test_sensors);
            data.set("sensor_type", params.data.sensor_type);
            params = { ...params, data };
            options.body = params.data;
        }
        else if (
          resource.includes("dashboards") &&
          resource.includes("companies") &&
          !resource.includes("widgets")
        ) {
          let _data;
          if (params.data.dashboard_type !== "device-general") {
            _data = {
              ...params.data,
              sensor_type: params.data.sensor_type ? params.data.sensor_type.toString() : ""
            };
          } else {
            _data = {
              ...params.data,
              sensor_type: params.data.sensor_type.toString()
            };
          }
          options.body = JSON.stringify(_data);
        } else {
          options.body = JSON.stringify(params.data);
        }

        break;
      case DELETE:
        url = `${API_URL}/${resource}/${params.id}`;
        options.method = "DELETE";
        break;
      case "DELETE_MANY":
        url = `${API_URL}/${resource}`;
        options.method = "DELETE";
        options.body = JSON.stringify(params.data);
        break;
      default:
        throw new Error(`Unsupported fetch action type ${type}`);
    }
    return { url, options };
  };

  /**
   * @function convertHTTPResponseToREST This function takes the response generated after
   * request is done and returns formatted response to the frontend
   * @param {Object} response HTTP response from fetch()
   * @param {String} type One of the constants appearing at the top if this file, e.g. 'UPDATE'
   * @param {String} resource Name of the resource to fetch, e.g. 'posts'
   * @param {Object} params The REST request params, depending on the type
   * @returns {Object} REST response
   */
  const convertHTTPResponseToREST = (response, type, resource, params) => {
    // logger(
    //   "convertHTTPResponseToREST called",
    //   response,
    //   "response",
    //   type,
    //   "type",
    //   resource,
    //   "resource"
    // );
    const { json, body } = response;
    switch (type) {
      case GET_LIST:
        if (!json) {
          // if the json is not defined
          let _fake_json = { data: [{ id: 1, content: body }], total: 1 };
          return _fake_json;
        }
        if (json.hasOwnProperty("data") && json.hasOwnProperty("total")) {
          let _json = json;
          if (!Array.isArray(json.data)) {
            _json.data = attach_id(object_to_array(json.data));
          } else if (
            !json.data.every(ob => ob.hasOwnProperty("id") && ob["id"])
          ) {
            _json.data = attach_id(_json.data);
          }
          if (resource === "sensor_types") {
            _json.data = _json.data.map(f => {
              let _configf = object_to_array(f.config_fields || {});
              let _fields = object_to_array(f.fields || {});
              let _data = {
                ...f,
                config_fields: _configf,
                fields: _fields,
                id: f.id.toString()
              };
              return _data;
            });
          }
          return _json;
        } else if (json.hasOwnProperty("data") && Array.isArray(json.data)) {
          let _json = json;
          _json.total = json.data.length; // fake the length
        } else if (Array.isArray(json)) {
          let _json = { data: json, total: json.length };
          return _json;
        } else {
          //special case scenarios
          // resource name - me
          if (resource === "me") {
            let ob = { ...json, id: 1 }; //fake id
            return { data: [ob], total: 1 }; //only one record
          } else if (resource === "events_log") {
            // resource name - events_log
            let ob = {
              data: attach_id([...json["event_logs"]]),
              total: json["event_logs"].length
            };
            return ob;
          } else {
            return { data: json };
          }
        }
      case UPDATE:
      case CREATE:
        let _data = { data: { ...params.data, ...json, id: json.id || "" } };
        return _data;
      case GET_ONE:
        // console.log(GET_ONE)
        if (resource === "sensor_types") {
          let _configf = object_to_array(json.config_fields || {});
          let _fields = object_to_array(json.fields || {});
          let _data = { ...json, config_fields: _configf, fields: _fields };
          let _json = { data: _data };
          logger("resource__sensor_types", _json);
          return _json;
        }
        // console.log(json)
        if (json && json["floormap"]) {
          let { company_key } = get_params(resource),
            transformed_resource = transformer(resource),
            url = `${window.API_URL}/${transformed_resource}/${
              json.id
            }/floormap?company_key=${company_key}`;
          // console.log(transformed_resource, url)
          let _json = { ...json, floormap: { url, title: json.floormap } }; // url to floormap is constructed.
          // console.log("_json", _json)
          return { data: _json };
        }
      default:
        if (!json) {
          return { data: {} };
        } else if (json.hasOwnProperty("data")) {
          // for those responses which respond with emptiness
          return json;
        } else {
          return { data: json || {} };
        }
    }
  };

  const { fetchJson } = fetchUtils;
  if (resource === "sensor_export" && type === "GET_LIST") {
    // console.log("echo back")
    return Promise.resolve({
      data: [{ id: 0, content: { type, resource, params } }],
      total: 1
    }); // fake it
  } else {
    if (resource === "company_sensors_by_type" && type === "GET_LIST") {
      let { sort: { field } } = params;
      if (field.startsWith("value.")) {
        params["sort"]["field"] = field.slice(6);
      }
    }
    const { url, options } = convertRESTRequestToHTTP(type, resource, params);
    // logger(url, options);
    if (useToken) {
      let token = sessionStorage.getItem("token");
      if (token) {
        options.user = {
          authenticated: true,
          token: `token ${token}`
        };
      }
    }
    return fetchJson(url, options).then(response => {
      logger("url, options, response", url, options, response);
      let restResponse = convertHTTPResponseToREST(
        response,
        type,
        resource,
        params
      );
      logger("@postFetchJSON:type, url, resource", type, url, resource);
      if (type === "GET_ONE" && resource.includes("my_dashboards")) {
        restResponse = { data: restResponse };
      }
      logger(
        "url, type, params, restResponse",
        url,
        // options,
        // response,
        // resource,
        type,
        params,
        restResponse
      );
      return restResponse;
    });
  }
}
export { rest_client };
