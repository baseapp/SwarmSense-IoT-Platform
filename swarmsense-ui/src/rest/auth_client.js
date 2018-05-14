/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
 
import {
  AUTH_LOGIN,
  AUTH_LOGOUT,
  AUTH_CHECK,
  AUTH_ERROR,
  AUTH_GET_PERMISSIONS,
  CREATE
} from "admin-on-rest";
import { login_api } from "./urls";
import { rest_client } from "./index";
import { logout, getPostLoginInitials, set_params } from "../utils";
import { getCurrentUser } from "./index";

/**
 * Manages user authentication. For more info  -{@link https://marmelab.com/admin-on-rest/Admin.html#authclient | authClient} prop.
 * @param type One of the AUTH_LOGIN, AUTH_LOGOUT, AUTH_CHECK, AUTH_ERROR.
 * @param params parameter passed according to type.
 * @returns {Promise} Resolves in storing login information in the redux store or checking if the user is logged in, based on sessionStorage.token
 */
function auth_client(type, params) {
  // console.log("auth_client is called", type, params);
  if (type === AUTH_LOGIN) {
    const { username, password } = params;
    return rest_client(
      CREATE,
      "login",
      {
        data: { email: username, password: password }
      },
      false
    )
      .then(({ data: { token } }) => {
        sessionStorage.setItem("token", token); // starting session.
        localStorage.setItem("current_user", token); // for opening new windows.
      })
      .then(() => {
        return getPostLoginInitials();
      })
      .then(d => {
        console.log(d, "postLoginInitials");
        // sessionStorage.setItem("post_login_initials", JSON.stringify(d));
        // localStorage.setItem("post_login_initials", JSON.stringify(d));
        if (d.current_user.role === "super_admin") {
          sessionStorage.setItem("company_role", "super_admin");
        } else {
          sessionStorage.setItem("company_role", d.global_company.role);
        }
        set_params("global_company", d.global_company);
        return d;
      })
      .catch(err => {
        console.log(err.message);
        sessionStorage.clear();
        throw err;
      });
  }
  if (type === AUTH_LOGOUT) {
    logout();
    return Promise.resolve();
  }
  if (type === AUTH_CHECK) {
    // checking if the token is there and isn't expired!
    let token = sessionStorage.getItem("token");
    if (token) {
      return Promise.resolve("Token found!");
    } else {
      return Promise.reject("No token found!");
    }
  }
  if (type === AUTH_ERROR) {
    // sessionStorage.clear()
    return;
  }
  if (type === AUTH_GET_PERMISSIONS) {
    const role = sessionStorage.getItem("company_role");
    return Promise.resolve(role);
  }
  return Promise.reject("Unknown method");
}
export { auth_client };
