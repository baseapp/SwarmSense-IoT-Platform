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
import { Map, Marker, Popup, TileLayer } from "react-leaflet";
import FlatButton from "material-ui/FlatButton";
import "./leaflet.css";

Leaflet.Icon.Default.imagePath =
  "//cdnjs.cloudflare.com/ajax/libs/leaflet/1.1.0/images/";

class LatLongInput extends React.Component {
  constructor(props) {
    super(props);
    let {
      location_lat: { input: { value: lat } },
      location_long: { input: { value: long } }
    } = props; // fields
    this.state = {
      zoom: 2,
      marker_lat: Number.parseFloat(lat),
      marker_long: Number.parseFloat(long),
      reset_lat: Number.parseFloat(lat),
      reset_long: Number.parseFloat(long)
    };
  }
  componentWillReceiveProps(nextProps) {
    let {
      location_lat: { input: { value: lat } },
      location_long: { input: { value: long } }
    } = nextProps;
    if (lat !== this.state.marker_lat || long !== this.state.marker_long) {
      let nextState = {
        ...this.state,
        marker_lat: Number.parseFloat(lat),
        marker_long: Number.parseFloat(long)
      };
      this.setState(nextState);
    }
  }
  setPosition(lat = null, long = null) {
    let {
      location_lat: { input: { onChange: changeLatitude } },
      location_long: { input: { onChange: changeLongitude } }
    } = this.props;
    if (lat && long) {
      changeLatitude(lat);
      changeLongitude(long);
    } else {
      changeLatitude(this.state.reset_lat);
      changeLongitude(this.state.reset_long);
    }
  }
  clickHandler(ev) {
    let { latlng: { lat: new_lat, lng: new_long } } = ev;
    this.setPosition(new_lat, new_long);
  }
  render() {
    let { marker_lat: lat, marker_long: long, zoom } = this.state;
    let position =
        Boolean(lat) && Boolean(long) ? [lat, long] : [28.5166866, 77.16438531],
      bounds =
        Boolean(lat) && Boolean(long)
          ? Leaflet.latLng(lat, long).toBounds(10000)
          : Leaflet.latLng(position).toBounds(10000000);
    return (
      <div>
        <div style={{ marginTop: "5px", padding: "3px" }}>
          <div>
            <div>Position(latitude, longitude)</div>
            <br />
            <div>{`${lat}, ${long}`}</div>
            <br />
            <FlatButton
              label="Reset"
              onClick={() => this.setPosition()}
              primary
            />
          </div>
        </div>
        <Map bounds={bounds} onClick={ev => this.clickHandler(ev)}>
          <TileLayer
            url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
          />
          {lat &&
            long && (
              <Marker position={[lat, long]}>
                <Popup>
                  <span>{`Latitude: ${lat}, Longitude: ${long}`}</span>
                </Popup>
              </Marker>
            )}
        </Map>
      </div>
    );
  }
}
export default /**
 * @name LatLongInput
 * @example <LatLongInput/>
 * @description
 * Custom input component. Presents user with the map to click and choose the location.
 */
LatLongInput;
