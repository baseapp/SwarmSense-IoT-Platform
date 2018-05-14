/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import { ViewTitle, Responsive } from "admin-on-rest/lib/mui";
import { connect } from "react-redux";
import { showNotification } from "admin-on-rest";
import Highcharts from "highcharts";
import ReactHighcharts from "react-highcharts";
import LinearProgress from "material-ui/LinearProgress";
import { moments_ago, make_query, set_params } from "../../utils";
import { getAlertHistory, getDashboard, getStats } from "../../rest";
import { HomeWidget as Widget } from "../index.js";

import "./table.css";

let cardStyles = {
  medium: {
    margin: "10px",
    minWidth: "23%",
    minHeight: "23%"
  },
  data_span: {
    float: "right"
  },
  data_container: {
    width: "80%"
  },
  label: {
    position: "relative",
    top: "10px"
  },
  small: {
    margin: "10px"
  },
  mediumContainer: {
    display: "grid",
    gridTemplateColumns: "25% 25% 25% 25%",
    gridTemplateRows: "auto auto auto",
    gridTemplateAreas: '"w1 w2 w3 w4""w5 w5 w5 w5""w6 w6 w7 w7"',
    justifyContent: "center",
    alignContent: "stretch",
    justifyItems: "stretch",
    alignItems: "stretch",
    gridRowGap: "10px",
    marginLeft: "-10px",
    marginTop: "7px"
  }
};

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    Highcharts.setOptions({
      global: {
        useUTC: false
      }
    });
    this.state = {
      loading: false,
      sensor_info: {},
      network_info: "",
      message_info: "",
      new_devices: "",
      daily_hits: [],
      event_logs: [],
      alert_history: [],
      new_user: false
    };
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener("resize", this.handleResize);
  }
  handleResize() {
    if (this.state.loading || window.application.drawer_menu_enabled) {
      return;
    } else {
      this.setState({ ...this.state, loading: true }, () => {
        setTimeout(() => {
          this.setState({ ...this.state, loading: false });
        }, "2000");
      });
    }
  }
  logged_in() {
    if (window.sessionStorage.getItem("token")) {
      return true;
    } else {
      return false;
    }
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }
  componentDidMount() {
    if (this.logged_in()) {
      this.setState({ ...this.state, loading: true }, async () => {
        let { company: { id: cid } } = this.props;
        try {
          let {
            total_sensors_up: sensors_up,
            total_sensors_down: sensors_down,
            total_sensors,
            event_logs,
            total_network
          } = await getDashboard({ cid }).then(({ data }) => data);
          if (total_sensors === 0) {
            this.setState({ ...this.state, new_user: true, loading: false });
          } else {
            let { data: alert_history } = await getAlertHistory({ cid });
            let {
              new_devices,
              daily_hits: { data: hits },
              message_received
            } = await getStats({ cid }).then(({ data }) => data);
            let newState = {
              ...this.state,
              new_user: false,
              sensor_info: {
                total_sensors: total_sensors.toString(),
                sensors_up: sensors_up.toString(),
                sensors_down: sensors_down.toString()
              },
              event_logs: event_logs.slice(0, 5),
              network_info: total_network.toString(),
              alert_history: alert_history.slice(0, 5),
              new_devices: new_devices.toString(),
              daily_hits: hits.sort(
                (a, b) => Date.parse(a.time) - Date.parse(b.time)
              ),
              loading: false,
              message_info: message_received.toString()
            };
            this.setState(newState);
          }
        } catch (err) {
          this.setState({ ...this.state, error: err.message, loading: false });
          this.props.dispatch(showNotification(err.message, "warning"));
        }
      });
    }
  }
  render() {
    if (!this.logged_in()) {
      return null;
    }
    if (this.state.loading) {
      return <LinearProgress />;
    }
    if (this.state.error) {
      let error_widget = (
        <Widget
          title="Error"
          cardStyle={cardStyles.small}
          content={
            "Please reload! If error persists, please contact developer!"
          }
        />
      );
      return (
        <Responsive
          small={
            <div>
              <ViewTitle title={window.application.settings.site_title} />
              {error_widget}
            </div>
          }
          medium={error_widget}
        />
      );
    } else if (this.state.new_user) {
      let nuser_widget = (
        <Widget
          title="Welcome user!"
          cardStyle={cardStyles.small}
          content={"No sensors added till now! Please add sensors."}
        />
      );
      return (
        <Responsive
          small={
            <div>
              <ViewTitle title={window.application.settings.site_title} />
              {nuser_widget}
            </div>
          }
          medium={nuser_widget}
        />
      );
    } else {
      let cid = this.props.company.id;
      let sensor_info_content = (
        <div style={cardStyles.data_container}>
          <span>Total</span> :{" "}
          <span>{this.state.sensor_info["total_sensors"] || ""}</span>
          {" / "}
          <span>Online</span> :{" "}
          <span>{this.state.sensor_info["sensors_up"] || ""}</span>
          {" / "}
          <span>Offline</span> :{" "}
          <span>{this.state.sensor_info["sensors_down"] || ""}</span>
        </div>
      );
      let network_info_content = (
        <div style={cardStyles.data_container}>
          <span>Total</span>
          <span style={cardStyles.data_span}>
            {this.state.network_info || ""}
          </span>
        </div>
      );
      let message_info_content = (
        <div style={cardStyles.data_container}>
          <span>Total received</span>
          <span style={cardStyles.data_span}>
            {this.state.message_info || ""}
          </span>
        </div>
      );
      let new_devices_info_content = (
        <div style={cardStyles.data_container}>
          <span>New</span>
          <span style={cardStyles.data_span}>{this.state.new_devices}</span>
        </div>
      );
      let event_logs_content = (
        <div>
          <table className="dashboard-table">
            <thead>
              <tr className="dashboard-tr">
                <th className="dashboard-th">Log</th>
                <th className="dashboard-th">Time</th>
              </tr>
            </thead>
            <tbody>
              {this.state.event_logs.map((ob, i) => {
                return (
                  <tr key={i} className="dashboard-tr">
                    <td className="dashboard-td">{ob.log}</td>
                    <td className="dashboard-td">{moments_ago(ob.time)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      let config = {
        chart: {
          zoomType: "x",
          panning: true,
          panKey: "shift",
          type: "spline"
        },
        title: {
          text: "Daily Hits Chart"
        },
        tooltip: {
          shared: true
        },
        series: [
          {
            yAxis: 1,
            data: this.state.daily_hits.map(ob => {
              let _ob = { x: Date.parse(ob.time), y: ob.message_count };
              return _ob;
            }),
            name: "messages received"
          },
          {
            yAxis: 0,
            data: this.state.daily_hits.map(ob => {
              let _ob = { x: Date.parse(ob.time), y: ob.active_sensors };
              return _ob;
            }),
            name: "active sensors"
          }
        ],
        yAxis: [
          {
            title: {
              text: "count"
            }
          },
          {
            title: {
              text: "messages received"
            },
            opposite: true
          }
        ],
        xAxis: {
          id: "x-axis",
          type: "datetime",
          title: {
            text: "time"
          },
          dateTimeLabelFormats: {
            millisecond: "%H:%M:%S.%L",
            second: "%H:%M:%S",
            minute: "%H:%M",
            hour: "%H:%M",
            day: "%e. %b",
            week: "%e. %b",
            month: "%b '%y",
            year: "%Y"
          },
          units: [
            [
              "millisecond", // unit name
              [1, 2, 5, 10, 20, 25, 50, 100, 200, 500] // allowed multiples
            ],
            ["second", [1, 2, 5, 10, 15, 30]],
            ["minute", [1, 2, 5, 10, 15, 30]],
            ["hour", [1, 2, 3, 4, 6, 8, 12]],
            ["day", [1]],
            ["week", [1]],
            ["month", [1, 3, 6]],
            ["year", null]
          ]
        },
        plotOptions: {
          spline: {
            marker: {
              enabled: true
            }
          }
        }
      };
      let daily_hits_content = <ReactHighcharts config={config} isPureConfig />;
      let alert_history_content = (
        <div>
          <table className="dashboard-table">
            <thead>
              <tr className="dashboard-tr">
                <th className="dashboard-th">Alert</th>
                <th className="dashboard-th">Time</th>
              </tr>
            </thead>
            <tbody>
              {this.state.alert_history.map((ob, i) => {
                return (
                  <tr key={i} className="dashboard-tr">
                    <td className="dashboard-td">
                      <a
                        href={`#/company_sensors?${make_query({
                          filter: { q: ob.sensor_name }
                        })}`}
                        className="simple-link"
                      >
                        {ob.alert_name}
                      </a>
                    </td>
                    <td className="dashboard-td">{moments_ago(ob.time)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      return (
        <Responsive
          small={
            <div>
              <ViewTitle title={window.application.settings.site_title} />
              <Widget
                title="Sensors"
                cardStyle={cardStyles.small}
                content={sensor_info_content}
                moreLink="#/company_sensors"
              />
              <Widget
                title="Networks"
                cardStyle={cardStyles.small}
                content={network_info_content}
                moreLink="#/company_networks"
              />
              <Widget
                title="Messages"
                cardStyle={cardStyles.small}
                content={message_info_content}
              />
              <Widget
                title="Devices"
                cardStyle={cardStyles.small}
                content={new_devices_info_content}
              />
              <Widget
                title="Daily-hits"
                cardStyle={cardStyles.small}
                content_id="daily-hits-chart"
                content={daily_hits_content}
              />
              <Widget
                title="Events"
                cardStyle={cardStyles.small}
                content={event_logs_content}
                moreLink="#/events_log"
                onMorePress={() => {
                  set_params("events_log", { cid });
                }}
              />
              <Widget
                title="Alerts"
                cardStyle={cardStyles.small}
                content={alert_history_content}
                moreLink="#/alert_history"
                onMorePress={() => {
                  set_params("alert", {});
                  set_params("sensor", {});
                }}
              />
            </div>
          }
          medium={
            <div style={cardStyles.mediumContainer}>
              <Widget
                title="Sensors"
                id="w1"
                cardStyle={cardStyles.medium}
                content={sensor_info_content}
                moreLink="#/company_sensors"
              />
              <Widget
                title="Networks"
                id="w2"
                cardStyle={cardStyles.medium}
                content={network_info_content}
                moreLink="#/company_networks"
              />
              <Widget
                title="Messages"
                id="w3"
                cardStyle={cardStyles.medium}
                content={message_info_content}
              />
              <Widget
                title="Devices"
                id="w4"
                cardStyle={cardStyles.medium}
                content={new_devices_info_content}
              />
              <Widget
                title="Daily-hits"
                id="w5"
                content={daily_hits_content}
                cardStyle={cardStyles.medium}
                content_id="daily-hits-chart"
              />
              <Widget
                title="Events"
                id="w6"
                cardStyle={cardStyles.medium}
                content={event_logs_content}
                moreLink="#/events_log"
                onMorePress={() => {
                  set_params("events_log", { cid });
                }}
              />
              <Widget
                title="Alerts"
                id="w7"
                cardStyle={cardStyles.medium}
                content={alert_history_content}
                moreLink="#/alert_history"
                onMorePress={() => {
                  set_params("alert", {});
                  set_params("sensor", {});
                }}
              />
            </div>
          }
        />
      );
    }
  }
}

Dashboard = connect(state => ({
  company: state.postLoginInitials.global_company
}))(Dashboard);

export default /**
 * @name Dashboard
 * @description A react functional component representing the
 * dashboard of the application. It contains the alert-history,
 * event-logs, etc.
 * @example <Dashboard/>
 */
Dashboard;
