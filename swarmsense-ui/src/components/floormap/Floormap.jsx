/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import LinearProgress from "material-ui/LinearProgress";
import { Card, CardText } from "material-ui/Card";
import FlatButton from "material-ui/FlatButton";
import { ViewTitle } from "admin-on-rest";
import InjectParams from "../InjectParams";
import Forwarder from "../Forwarder";
import { resolveIfCompany } from "../../utils";
import { getAllNetworkSensors } from "../../rest";
import { parse_query, get_logger, set_params } from "../../utils";
import "./floormap.css";
import random from "lodash.random";
// Leaflet.Icon.Default.imagePath = "/images/";

function random_coordinates() {
  // simulating for x and y coordinate.
  let x = random(200),
    y = random(-200, 0);
  return { x, y };
}

/**
 * React component for showing positions of sensors.
 **/

class Floormap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      network_sensors: [], // sensors in the network
      loading: true, // current ajax request status
      error: null
    };
    this.log = get_logger("floormap", true); //switched off
  }
  async getSensors(cid, nid) {
    let sensors = await getAllNetworkSensors({ cid, nid });
    // this.log(sensors);
    //simulating latitude and longitude positions
    sensors.data = sensors.data.map(sensor => {
      let { x: location_lat, y: location_long } = random_coordinates();
      sensor.value = {
        ...sensor.value,
        location_lat,
        location_long
      };
      // this.log(
      //   "simulation effect",
      //   sensor.id,
      //   sensor.value.location_lat,
      //   sensor.value.location_long
      // );
      return sensor;
    });
    return sensors;
  }
  /**
   * connects to mqtt backend and get the live positions as they are updated.
   */
  getLiveUpdates() {
    let network_sensors = this.state.network_sensors.map(sensor => {
      let { id, key } = sensor;
      let subscribe_options = {
        filter: `sensors/${id}/values`,
        qos: 2
      };
      let client_options = {
        // ipaddr: "45.79.8.213",
        // port: 15675,
        // endpoint: "/ws",
        clientId: `client_${id}`,
        onMessageArrived: mesg => {
          // this.log("onMessageArrived", mesg);
          let network_sensors = this.state.network_sensors.map(sensor => {
            if (sensor.id === id) {
              let { time: last_update, fromServer, ...value } = JSON.parse(
                mesg.payloadString
              );
              //simulating value for a few sensors, probably half of them.
              let gateway_factor = Math.random(); // decides if the device act as gateway
              this.log("@gateway_factor");
              if (gateway_factor <= 0.5) {
                // make it a non-gateway device
                let {
                  x: location_lat,
                  y: location_long
                } = random_coordinates();
                value = {
                  ...value,
                  location_lat,
                  location_long
                };
                this.log("updating value on mqtt update", sensor);
                if (sensor["map_marker"]) {
                  this.log("updating map marker value");
                  sensor.map_marker.setLatLng([location_lat, location_long]);
                }
              }
              sensor = { ...sensor, value, last_update };
            }
            return sensor;
          });
          this.setState({ ...this.state, network_sensors });
        },
        comments: `s-id:${id}`
      };
      let connect_options = {
        timeout: 3,
        userName: `sensor_${id}`,
        password: `${key}`
      };
      try {
        let client = window.mqtt_subscribe(
          client_options,
          connect_options,
          subscribe_options
        );
        sensor.mqtt_client = client;
      } catch (err) {
        this.log(
          "Error while connecting to mqtt ",
          "sensor_id",
          id,
          err.message || err
        );
      }
      return sensor;
    });
    this.setState({ ...this.state, network_sensors });
  }
  /**
   * disconnects the mqtt clients of all the sensors.
   */
  stopLiveUpdates() {
    this.state.network_sensors
      .filter(sensor => sensor.mqtt_client)
      .map(({ id, mqtt_client }) => {
        try {
          mqtt_client.disconnect();
        } catch (err) {
          this.log("Error while disconnecting", "sensor_id", id);
        }
        return null;
      });
  }
  componentWillUnmount() {
    this.stopLiveUpdates();
  }
  async componentDidMount() {
    let {
      match: { params: { network_id } },
      location: { search },
      global_company: { id: cid }
    } = this.props;
    if (network_id && cid) {
      // if the network id and company id are mentioned
      try {
        let { data: sensors } = await this.getSensors(cid, network_id);
        // this.log(sensors);
        this.setState(
          {
            ...this.state,
            network_sensors: sensors,
            loading: false
          },
          () => {
            this.render_map(() => this.getLiveUpdates());
          }
        );
      } catch (err) {
        this.log("Error while fetching", err.mesg || err);
        this.setState({
          ...this.state,
          error: `${err.message || err}`,
          loading: false
        });
      }
    } else {
      this.setState({
        ...this.state,
        error: "network_id and/or company id is not mentioned!"
      });
    }
  }
  render_map(callback) {
    let imageUrl = `${window.API_URL}/companies/${
        this.props.global_company.id
      }/networks/${this.props.match.params.network_id}/floormap?company_key=${
        this.props.global_company.key
      }`,
      // map_layer = Leaflet.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png"),
      imageBounds = [[0, 200], [200, -200]],
      image_layer = Leaflet.imageOverlay(imageUrl, imageBounds),
      map_instance = Leaflet.map("floor-map", {
        layers: [image_layer],
        center: [100, -100],
        crs: Leaflet.CRS.Simple, // for mapping x and y-axis coordinates directly.
        zoom: 1,
        maxZoom: 3,
        minZoom: 1,
        maxBounds: imageBounds
      });
    let network_sensors = this.state.network_sensors.map(sensor => {
      let map_marker = Leaflet.marker([
        sensor.value.location_lat,
        sensor.value.location_long
      ]).addTo(map_instance);
      let a = document.createElement("a");
      a.href = "#/sensor_chart";
      a.innerHTML = sensor.name.toUpperCase();
      a.addEventListener("click", e => {
        set_params("sensor", sensor);
      });
      map_marker.bindPopup(a).openPopup();
      this.log(sensor.id, map_marker.getLatLng());
      return { ...sensor, map_marker };
    });
    this.log("@render_map_pre", network_sensors);
    this.setState({ ...this.state, map_instance, network_sensors }, () => {
      this.log("@render_map", this.state);
      if (callback) callback();
    });
  }
  render() {
    // this.log("Sensor-data", this.state.network_sensors);
    return (
      <Card style={{ marginTop: "17px" }}>
        <ViewTitle title="Floormap" />
        <div style={{ float: "right", marginTop: "10px", marginRight: "10px" }}>
          <FlatButton
            label="Back"
            onClick={() => window.history.back()}
            primary
          />
        </div>
        {this.state.loading || !this.props.global_company.id ? (
          <LinearProgress />
        ) : (
          <CardText>
            <div
              id="floor-map"
              style={{
                clear: "both",
                height: "600px",
                textAlign: "center",
                marginTop: "5px"
              }}
            />
          </CardText>
        )}
      </Card>
    );
  }
}

export default props => (
  <InjectParams
    resolve={resolveIfCompany}
    OnFailResolve={<Forwarder to="/" message="No company found!" />}
  >
    <Floormap {...props} />
  </InjectParams>
);
