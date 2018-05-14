/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
 
import { getSettings, rest_client } from "../rest";
import {
  set_developer_info,
  getPostLoginInitials,
  subscribe,
  get_logger,
  check_support_web_storage,
  set_params
} from "./index";

/**
 * This callback is used to indicate change of stage while setting environment.
 * It is provided by the caller in order to get information about the stage in progress.
 * @callback change_stage
 * @arg {string} newStage The name indicating the stage.
 */
/**
 * Sets the app environment, before actually loading the main application.
 *  Stages -
 *  1. CHECKING_WEB_STORAGE : Checks for the support of web storage.
 *  2. CHECKED_WEB_STORAGE : Web storage is supported.
 *  3. REQUESTING_WEB_SETTINGS : Get settings from the API endpoint - "/settings".
 *  4. WEB_SETTINGS_REQUEST_COMPLETED : Successfully got the settings.
 *  5. APPLYING_WEB_SETTINGS : Storing the settings in "windows.application.settings".
 *  6. WEB_SETTINGS_APPLIED : Stored the settings.
 *  7. ADDING_DEVELOPER_INFO : Adding some developer relevant information.
 *  8. DEVELOPER_INFO_ADDED : Added dev info.
 *  9. SEARCHING_TOKEN : Searching for a "token" key in "window.localStorage", indicating user is already logged in.
 *  10. REQUESTING_POST_LOGIN_INITIALS : If the user is already logged in, requesting information from these endpoints - "/me", "/me/meta_data", "/companies".
 *  11. POST_LOGIN_INITIALS_REQUEST_COMPLETED : Successfully request is completed.
 *  12. POST_LOGIN_INTIIALS_REQUEST_FAILED : Request failed, possibly due to token-expired or network-down.
 *  13. TOKEN_NOT_FOUND : The "token" key isn't there in "window.localStorage" i.e. User is not logged in.
 *  14. ERROR_ENVIRONMENT_SET : Error occurred while setting up environment.
 *  15. CONFIG_FOUND : Config commands found in the url. Used for features such as login-as another user, etc.
 *  16. TOKEN_FOUND_LOGIN_AS : Token found in url.
 *  17. TOKEN_NOT_FOUND_CONFIG : Token not found in url.
 * @arg {change_stage} change_stage Callback to inform caller about the changing state.
 * @returns {Promise} Resolves in setting the environment and checking various things. Throws error on any error/"ERROR_ENVIRONMENT_SET".
 */
async function set_app_settings(change_stage = newStage => newStage) {
  window.application = {};
  window.mqtt_subscribe = subscribe;
  let last_successful_stage = undefined, // records the stage as the promises go.
    logger = get_logger("set_app_settings"),
    token_found_login_as = false;
  change_stage("CHECKING_WEB_STORAGE");
  last_successful_stage = "CHECKED_WEB_STORAGE";
  return check_support_web_storage()
    .then(() => {
      change_stage("CHECKED_WEB_STORAGE");
      last_successful_stage = "CHECKED_WEB_STORAGE";
      change_stage("REQUESTING_WEB_SETTINGS");
      last_successful_stage = "REQUESTING_WEB_SETTINGS";
      return getSettings();
    })
    .then(({ data: json }) => {
      change_stage("WEB_SETTINGS_REQUEST_COMPLETED");
      last_successful_stage = "WEB_SETTINGS_REQUEST_COMPLETED";
      change_stage("APPLYING_WEB_SETTINGS");
      last_successful_stage = "APPLYING_WEB_SETTINGS";
      window.application["settings"] = { ...json };
      window.document.title = window.application.settings.site_title; //setting title
    })
    .then(() => {
      change_stage("WEB_SETTINGS_APPLIED");
      last_successful_stage = "WEB_SETTINGS_APPLIED";
      change_stage("ADDING_DEVELOPER_INFO");
      last_successful_stage = "ADDING_DEVELOPER_INFO";
      let build_version = "1.0.2-beta",
        d = new Date("May 11, 2018 11:00:00 +0530"),
        build_on = `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`,
        change_logs = [
          "Now, MQTT client(host, port, endpoint) can be configured using config.js just like backend REST url.",
          "Time persistence across all the sensors for sensor-history(graph)",
          "API docs: adding module to guide through directory structure",
          "Design explained using execution flow while user interact.",
          "Added design section for the design of the app in the developer's manual",
          "Added howtos in the developer's manual",
          "Developer's manual is available at /docs",
          "Now, menu labels can be configured for the select type config-fields' values while making sensor-type",
          "Device dashboard for sensor-types accessible using the device list",
          "Device dashboards - Get custom dashboards ready for any number of sensors by creating for one.",
          "Toolbar added with current company name and menu for account & logout.",
          "Calendar view for event-scheduling",
          "Persistent( browser reload safe; localStorage based; ) locally selected global company.",
          "Improved dashboards with resizeable and droppable widgets",
          "Graph widgets can now show history values also using 'history duration' field.",
          "Newer user-profile page for ease-of-access.",
          "Custom-routes' components with login-required can be configured using WithLogin",
          "Added support for file opening(browser-dependent) for historic(sensor-history) values which are url.",
          "Sensor-history can now be compared for various sensors.",
          "Web-Settings list sorted by group(default).",
          "Graphs in sensor-history sections can now be viewed in more than one column.",
          "Added title-bar in sensor-configuration editing for mobile view.",
          "Added some padding around the map for better mobile experience.",
          "Fixed: Sort by fields in same kind of sensors.",
          "In the mobile view, sensors can be selected and deleted/added from/to network from the sensors list.",
          "Graphs/history values now are ordered according to weight given to fields",
          "Updated alerts-creating/editing form",
          "Mobile site now has icon-menu to go to other routes such as sensor-history, edit(sensor) and sensor-type(filter) from sensors list.",
          "Preserved logins after the windows are closed.",
          "Preserved changed-company, once it is changed.",
          "Added informational developer space in the menu, for current milestones."
        ];
      set_developer_info({ build_version, build_on, change_logs });
    })
    .then(async () => {
      change_stage("DEVELOPER_INFO_ADDED");
      last_successful_stage = "DEVELOPER_INFO_ADDED";
      change_stage("SEARCHING_TOKEN");
      last_successful_stage = "SEARCHING_TOKEN";
      // let token = sessionStorage.getItem("token"),
      // logger("window.location", window.location);
      let token = undefined,
        query = window.location.search,
        post_login_initials = {
          current_user: {},
          meta_data: {},
          global_company: {}
        };
      // logger("query", query);
      if (query.startsWith("?config=")) {
        change_stage("CONFIG_FOUND");
        last_successful_stage = "CONFIG_FOUND";
        try {
          let json_pointer = "?config=".length,
            sliced = query.slice(json_pointer),
            decoded = window.decodeURI(sliced);
          logger("sliced", sliced, "decoded", decoded);

          let { command, payload } = JSON.parse(decoded);

          if (command === "login_as" && payload) {
            change_stage("TOKEN_FOUND_LOGIN_AS");
            last_successful_stage = "TOKEN_FOUND_LOGIN_AS";
            token_found_login_as = true;
            sessionStorage.setItem("token", payload);
            sessionStorage.setItem("logged_in_as", "1");
            token = payload; // assigning the newly found token from the url
          } else {
            change_stage("TOKEN_NOT_FOUND_CONFIG");
            last_successful_stage("TOKEN_NOT_FOUND_CONFIG");
          }
        } catch (e) {
          logger("Error post CONFIG_FOUND", e.message || e);
          throw e;
        } finally {
          window.history.replaceState({}, "", "/#/");
        }
      } else {
        let logged_in_as = sessionStorage.getItem("logged_in_as");
        if (!logged_in_as || logged_in_as !== "1") {
          sessionStorage.setItem("logged_in_as", "0");
        }
        // higher precedence of the config command login_as.
        // hence, token given as payload will override the locally stored
        // token.
        token = sessionStorage.getItem("token");
        if (!token) {
          let current_user = localStorage.getItem("current_user");
          logger("current_user", current_user);
          if (current_user) {
            token = current_user;
            sessionStorage.setItem("token", token);
            logger("token", token);
          }
        }
      }
      if (token) {
        // load the current user data from the api if the token is set and subsequently check for token expiration.
        change_stage("REQUESTING_POST_LOGIN_INITIALS");
        last_successful_stage = "REQUESTING_POST_LOGIN_INITIALS";
        try {
          post_login_initials = await getPostLoginInitials();
          // sessionStorage.setItem(
          //   "post_login_initials",
          //   JSON.stringify(post_login_initials)
          // );
          if (token_found_login_as) {
            // if token is found in the url, load a reload safe (sessionStorage based) logged-in web app session.
            sessionStorage.setItem(
              "post_login_initials",
              JSON.stringify(post_login_initials)
            );
          } else {
            let cached_post_login_initials = "";
            if (sessionStorage.getItem("logged_in_as") === "1") {
              cached_post_login_initials = sessionStorage.getItem(
                "post_login_initials"
              );
            } else {
              cached_post_login_initials = localStorage.getItem(
                "post_login_initials"
              );
            }
            // selectively change the post_login_initials.global_company using the cached version
            if (cached_post_login_initials) {
              cached_post_login_initials = JSON.parse(
                cached_post_login_initials
              );
              // logger(
              //   "@setting_post_login_initials: cached_post_login_initials",
              //   cached_post_login_initials
              // );
              if (cached_post_login_initials["global_company"]) {
                post_login_initials.global_company =
                  cached_post_login_initials.global_company;
              }
            }
            if (sessionStorage.getItem("logged_in_as") === "1") {
              sessionStorage.setItem(
                "post_login_initials",
                JSON.stringify(post_login_initials)
              );
            } else {
              localStorage.setItem(
                "post_login_initials",
                JSON.stringify(post_login_initials)
              );
            }
          }
          change_stage("POST_LOGIN_INITIALS_REQUEST_COMPLETED");
          last_successful_stage = "POST_LOGIN_INITIALS_REQUEST_COMPLETED";
          let company_role = "super_admin";
          change_stage("GETTING_COMPANY_ROLE");
          if (post_login_initials.current_user.role !== "super_admin") {
            ({
              data: { role: company_role } = { role: undefined }
            } = await rest_client(
              "GET_ONE",
              `companies/${post_login_initials.global_company.id}`,
              {}
            ));
          }
          sessionStorage.setItem("company_role", company_role);
          change_stage("COMPANY_ROLE_SET");
          // console.log("company_role", company_role);
          set_params("global_company", post_login_initials.global_company);
          return Promise.resolve({
            logged_in: true,
            post_login_initials
          });
        } catch (e) {
          change_stage("POST_LOGIN_INITIALS_REQUEST_FAILED");
          last_successful_stage =
            "GETTING_COMPANY_ROLE || REQUESTING_POST_LOGIN_INITIALS";
          // token should be expired or network is down - hypothesis
          return Promise.resolve({
            logged_in: false,
            post_login_initials
          });
        }
      } else {
        change_stage("TOKEN_NOT_FOUND");
        last_successful_stage = "TOKEN_NOT_FOUND";
        return Promise.resolve({
          logged_in: false,
          post_login_initials
        });
      }
    })
    .catch(e => {
      change_stage("ERROR_ENVIRONMENT_SET");
      logger("@catch", "Last-stage", last_successful_stage);
      logger(e.message || e);
      throw e;
    });
}

export { set_app_settings };
