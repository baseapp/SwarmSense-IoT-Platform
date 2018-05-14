/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import ReactDOM from "react-dom";
import MonconAdminApp from "./MonconAdminApp";
import { IMOffline, IMLoading } from "./components";
import { get_logger } from "./utils";
// import registerServiceWorker, { unregister } from "./registerServiceWorker"; // only for developmental stage. comment it for production
import "./index.css";
import { set_app_settings as setAppSettings } from "./utils";

/**
 * This includes all the source of the app.
 * @module src
 */

/**
 * MonconUI - React component to prepare the environment and load the main application( MonconAdminApp ).
 * It fetches public settings, user's global/default company, user meta-data and then passes the information,
 * down to MonconAdminApp using the prop postLoginInitials.
 * It also adds various event handlers - online-offline response, disables context menu, disables to open a link
 * in new tab or window.
 */

class MonconUI extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      stage: "APP_START",
      online: window.navigator.onLine || undefined,
      post_login_initials: {}
    };
    this.logger = get_logger("MonconUI");
    window.addEventListener("online", e => {
      if (!this.state.online) {
        this.setState({ ...this.state, loading: true }, async () => {
          await this.set_app_env(() => {
            this.setState({ ...this.state, online: true, loading: false });
          });
        });
      }
    });
    // The addEventListener() method is not supported in Internet Explorer 8 and earlier versions.
    window.addEventListener("offline", e => {
      if (this.state.online) {
        this.setState({ ...this.state, online: false });
      }
    });
    window.addEventListener("click", e => {
      // console.log("Click happened", e);
      if (e.target.tagName === "A" && (e.ctrlKey || e.shiftKey)) {
        e.preventDefault();
      }
    });
    window.addEventListener("contextmenu", e => {
      e.preventDefault();
      // console.log("contextmenu event", e);
    });
  }
  async set_app_env(onSuccess = null) {
    this.setState(
      { ...this.state, stage: "LOADING_ENVIRONMENT", loading: true },
      async () => {
        try {
          let { post_login_initials } = await setAppSettings(new_stage => {
            this.logger("@set_app_settings_stage", new_stage);
            this.setState({ ...this.state, stage: new_stage });
          });
          this.setState(
            {
              ...this.state,
              post_login_initials,
              stage: "ENVIRONMENT_SET",
              loading: false
            },
            () => {
              onSuccess ? onSuccess() : null;
            }
          );
        } catch (e) {
          console.log(e);
          this.setState({
            ...this.state,
            stage: "ERROR_",
            error: e.message || e,
            loading: false
          });
        }
      }
    );
  }
  async componentDidMount() {
    await this.set_app_env();
  }
  render() {
    let app = undefined;
    if (this.state.online) {
      if (this.state.loading) {
        app = <IMLoading stage={this.state.stage} />;
      } else {
        switch (this.state.stage) {
          case "ENVIRONMENT_SET": {
            app = (
              <div>
                <style
                  dangerouslySetInnerHTML={{
                    __html: ["a:hover {", "cursor: pointer;", "}"].join("\n")
                  }}
                />
                <MonconAdminApp
                  postLoginInitials={this.state.post_login_initials}
                />
              </div>
            );
            break;
          }
          case "ERROR_ENVIRONMENT_SET": {
            app = <div>Error while setting environment</div>;
            break;
          }
          default: {
            app = null;
          }
        }
      }
    } else {
      app = <IMOffline />;
    }
    return app;
  }
}

/**
 * @module moncon-web-frontend
 * @description A single page web application that works with any REST based moncon-backend.
 */
/**
 * Renders the react app in the element
 * with id root.
 */
function render_app() {
  ReactDOM.render(<MonconUI />, document.getElementById("root"));
  // registerServiceWorker(); // only for developmental stage. comment it for production
}
render_app();
