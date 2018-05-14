/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
 
import React from "react";
import { get_params, get_logger } from "../../utils";
import InjectParams from "../InjectParams";
import "./design.css";

/**
 * Class representing breadcrumbs in the application to show the location
 * of the page to the user.
 * @extends React.Component
 */

class BreadCrumbs extends React.Component {
  constructor(props) {
    super(props);
    this.should_check = 0;
    let url = this.props.url;
    this.state = { url, breadcrumbs: "" };
    this.log = get_logger("BreadCrumbs", true); //switched off
    // this.log(this.props);
  }

  /**
   * build_breadcrumbs - It makes the breadcrumb element on the basis of the url.
   *
   * @return {React.Node} A react node defining the breadcrumb.
   */

  build_breadcrumbs() {
    let { url } = this.state;
    let {
      sensor: { name: sensor_name, id: sensor_id } = { name: "", id: "" },
      network: { name: network_name, id: network_id } = { name: "", id: "" },
      global_company,
      alert: { name: alert_name } = { name: "" },
      user: { name: user_name } = { name: "" },
      sensor_type: { title: sensor_type_name } = { title: "" },
      setting: { key: setting_name } = { key: "" },
      multiple
    } = this.props;
    if (url) {
      let breadcrumbs = null;
      let home = <a href="#/">Home</a>;
      let bc_sep = <span className="bc_separator"> / </span>;
      url = url.split("/").filter(st => st);
      let url_end = "";
      if (url.length > 1) {
        if (url[1] === "create") {
          url_end = " / Create";
        } else {
          this.log("url_0", url[0], url[1]);
          switch (url[0]) {
            case "company_sensors":
            case "company_network_sensors": {
              url_end = <span> / {sensor_name}</span>;
              break;
            }
            case "company_networks": {
              url_end = <span> / {network_name}</span>;
              break;
            }
            case "sensor_alerts":
            case "company_network_alerts":
            case "company_alerts": {
              url_end = <span> / {alert_name}</span>;
              break;
            }
            case "company_users": {
              url_end = " / Edit";
              break;
            }
            case "companies": {
              url_end = <span> / {global_company.name}</span>;
              break;
            }
            case "users": {
              url_end = <span> / {user_name}</span>;
              break;
            }
            case "sensor_types": {
              url_end = <span> / {sensor_type_name}</span>;
              break;
            }
            case "settings": {
              url_end = <span> / {setting_name}</span>;
              break;
            }
            default:
              url_end = ` / ${url[1]}`;
          }
        }
      }
      // let params = get_params(url[0])
      // console.log('params', params, url)

      switch (url[0]) {
        case "company_sensors": {
          breadcrumbs = (
            <div>
              <span>{home}</span>
              {bc_sep}
              <span>
                <a href={`#/company_sensors`}>Devices</a>
              </span>
              {url_end}
            </div>
          );
          break;
        }
        case "sensors_map": {
          breadcrumbs = (
            <div>
              <span>{home}</span>
              {bc_sep}
              <span>
                <a href={`#/company_sensors`}>Devices</a>
              </span>
              {bc_sep}
              <span>
                <a href={`#/sensors_map`}>{`Map`}</a>
              </span>
            </div>
          );
          break;
        }
        case "company_sensors_by_type":
          breadcrumbs = (
            <div>
              <span>{home}</span>
              {bc_sep}
              <span>
                <a href={`#/company_sensors`}>Devices</a>
              </span>
              {bc_sep}
              <span>
                <a href={`#/company_sensors_by_type`}>By-type</a>
              </span>
            </div>
          );
          break;
        case "sensors_type_map":
          breadcrumbs = (
            <div>
              <span>{home}</span>
              {bc_sep}
              <span>
                <a href={`#/company_sensors`}>Devices</a>
              </span>
              {bc_sep}
              <span>
                <a href={`#/company_sensors_by_type`}>By-type</a>
              </span>
              {bc_sep}
              <span>
                <a href={`#/company_sensors_by_type`}>{`Map`}</a>
              </span>
            </div>
          );
          break;
        case "sensor_configuration": {
          breadcrumbs = (
            <div>
              <span>{home}</span>
              {bc_sep}
              <span>
                <a href={`#/company_sensors`}>Devices</a>
              </span>
              <span>
                <a href={`#/company_sensors/${sensor_id}`}>
                  <span> / {sensor_name}</span>
                </a>
              </span>
              {bc_sep}
              <span>
                <a href={`#/sensor_configuration`}>Configure</a>
              </span>
            </div>
          );
          break;
        }
        case "sensor_alerts": {
          breadcrumbs = (
            <div>
              <span>{home}</span>
              {bc_sep}
              <span>
                <a href={`#/company_sensors`}>Devices</a>
              </span>
              <span>
                <a href={`#/company_sensors/${sensor_id}`}>
                  <span> / {sensor_name}</span>
                </a>
              </span>
              {bc_sep}
              <span>
                <a href={`#/sensor_alerts`}>Alerts</a>
              </span>
              {url_end}
            </div>
          );
          break;
        }
        case "sensor_history": {
          breadcrumbs = (
            <div>
              <span>{home}</span>
              {bc_sep}
              <span>
                <a href={`#/company_sensors`}>Devices</a>
              </span>
              <span>
                <a href={`#/company_sensors/${sensor_id}`}>
                  <span> / {sensor_name}</span>
                </a>
              </span>
              {bc_sep}
              <span>
                <a href={`#/sensor_history`}>{`History`}</a>
              </span>
            </div>
          );
          break;
        }
        case "sensor_chart": {
          breadcrumbs = (
            <div>
              <span>{home}</span>
              {bc_sep}
              <span>
                <a href={`#/company_sensors`}>Devices</a>
              </span>
              <span>
                {multiple ? (
                  " / Compare"
                ) : (
                  <a href={`#/company_sensors/${sensor_id}`}>
                    <span> / {sensor_name}</span>
                  </a>
                )}
              </span>
              {bc_sep}
              <span>
                <a href={`#/sensor_history`}>{`History`}</a>
              </span>
              {bc_sep}
              <span>
                <a href={`#/sensor_chart`}>Graphs</a>
              </span>
            </div>
          );
          break;
        }
        case "sensor_export": {
          breadcrumbs = (
            <div>
              <span>{home}</span>
              {bc_sep}
              <span>
                <a href={`#/company_sensors`}>Devices</a>
              </span>
              <span>
                <a href={`#/company_sensors/${sensor_id}`}>
                  <span> / {sensor_name}</span>
                </a>
              </span>
              {bc_sep}
              <span>
                <a href={`#/sensor_history`}>{`History`}</a>
              </span>
              {bc_sep}
              <span>
                <a href={`#/sensor_export`}>{"Export"}</a>
              </span>
            </div>
          );
          break;
        }
        case "company_networks": {
          breadcrumbs = (
            <div>
              <span>{home}</span>
              {bc_sep}
              <span>
                <a href={`#/company_networks`}>Networks</a>
              </span>
              {url_end}
            </div>
          );
          break;
        }
        case "company_network_sensors": {
          breadcrumbs = (
            <div>
              <span>{home}</span>
              {bc_sep}
              <span>
                <a href={`#/company_networks`}>Networks</a>
              </span>
              <span>
                <span> / {network_name}</span>
              </span>
              {bc_sep}
              <span>
                <a href={`#/company_network_sensors`}>Devices</a>
              </span>
              {url_end}
            </div>
          );
          break;
        }
        case "network_sensors_map": {
          breadcrumbs = (
            <div>
              <span>{home}</span>
              {bc_sep}
              <span>
                <a href={`#/company_networks`}>Networks</a>
              </span>
              {bc_sep}
              <span>
                <a href={`#/company_network_sensors`}>Devices</a>
              </span>
              {bc_sep}
              <span>
                <a href={`#/network_sensors_map`}>{`Map`}</a>
              </span>
            </div>
          );
          break;
        }
        case "company_network_alerts": {
          breadcrumbs = (
            <div>
              <span>{home}</span>
              {bc_sep}
              <span>
                <a href={`#/company_networks`}>Networks</a>
              </span>
              <span>
                <a href={`#/company_networks/${network_id}`}>
                  <span> / {network_name}</span>
                </a>
              </span>
              {bc_sep}
              <span>
                <a href={`#/company_network_alerts`}>Alerts</a>
              </span>
              {url_end}
            </div>
          );
          break;
        }
        case "events_log": {
          breadcrumbs = (
            <div>
              <span>{home}</span>
              {bc_sep}
              <span>
                <a href={`#/events_log`}>Events-log</a>
              </span>
              <span>
                <span> / {global_company.name}</span>
              </span>
            </div>
          );
          break;
        }
        case "company_alerts": {
          breadcrumbs = (
            <div>
              <span>{home}</span>
              {bc_sep}
              <span>
                <a href={`#/company_alerts`}>Alerts</a>
              </span>
              {url_end}
            </div>
          );
          break;
        }
        case "alert_history": {
          breadcrumbs = (
            <div>
              <span>{home}</span>
              {bc_sep}
              <span>
                <a href={`#/company_alerts`}>Alerts</a>
              </span>
              {bc_sep}
              <span>
                <a href={`#/alert_history`}>{`History`}</a>
              </span>
            </div>
          );
          break;
        }
        case "company_users": {
          breadcrumbs = (
            <div>
              <span>{home}</span>
              {bc_sep}
              <span>
                <a href={`#/company_users`}>Users(company)</a>
              </span>
              {url_end}
            </div>
          );
          break;
        }
        case "companies": {
          breadcrumbs = (
            <div>
              <span>{home}</span>
              {bc_sep}
              <span>
                <a href={`#/companies`}>Companies</a>
              </span>
              {url_end}
            </div>
          );
          break;
        }
        case "me": {
          breadcrumbs = (
            <div>
              <span>{home}</span>
              {bc_sep}
              <span>
                <a href={`#/me`}>Account</a>
              </span>
            </div>
          );
          if (url.length > 1) {
            breadcrumbs = (
              <div>
                <span>{home}</span>
                {bc_sep}
                <span>
                  <a href={`#/me`}>Account</a>
                </span>
                {bc_sep}
                <span>
                  <a href={`#/me/create`}>Edit</a>
                </span>
              </div>
            );
          }
          break;
        }
        case "my_meta_data": {
          breadcrumbs = (
            <div>
              <span>{home}</span>
              {bc_sep}
              <span>
                <a href={`#/me`}>Account</a>
              </span>
              {bc_sep}
              <span>
                <a href={`#/my_meta_data`}>User-settings</a>
              </span>
              {url_end}
            </div>
          );
          if (url.length > 1) {
            breadcrumbs = (
              <div>
                <span>{home}</span>
                {bc_sep}
                <span>
                  <a href={`#/me`}>Account</a>
                </span>
                {bc_sep}
                <span>
                  <a href={`#/my_meta_data`}>User-settings</a>
                </span>
                {bc_sep}
                <span>
                  <a href={`#/my_meta_data/create`}>Edit</a>
                </span>
              </div>
            );
          }
          break;
        }
        case "users": {
          breadcrumbs = (
            <div>
              <span>{home}</span>
              {bc_sep}
              <span>
                <a href={`#/users`}>Users(all)</a>
              </span>
              {url_end}
            </div>
          );
          break;
        }
        case "sensor_types": {
          breadcrumbs = (
            <div>
              <span>{home}</span>
              {bc_sep}
              <span>
                <a href={`#/sensor_types`}>Sensor-types</a>
              </span>
              {url_end}
            </div>
          );
          break;
        }
        case "settings": {
          breadcrumbs = (
            <div>
              <span>{home}</span>
              {bc_sep}
              <span>
                <a href={`#/settings`}>Web-settings</a>
              </span>
              {url_end}
            </div>
          );
          break;
        }
        default:
      }
      return breadcrumbs;
    } else {
      return null;
    }
  }
  componentWillReceiveProps(newProps) {
    if (newProps.url !== this.props.url) {
      let url = newProps.url;
      let params = {};
      let _u = url.split("/").filter(s => s)[0] || undefined;
      if (_u) {
        params = get_params(_u);
      }
      this.setState({ ...this.state, url, params });
    }
  }

  render() {
    let bc = this.build_breadcrumbs();

    if (!bc) {
      return null;
    } else {
      return <span>{bc}</span>;
    }
  }
}
export default props => (
  <InjectParams>
    <BreadCrumbs {...props} />
  </InjectParams>
);
