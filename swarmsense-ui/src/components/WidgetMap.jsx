/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import Leaflet from "leaflet";
import { Map, Marker, Popup, TileLayer } from "react-leaflet";
import PropTypes from "prop-types";

const WidgetMap = ({ position, markerText }) => (
  <Map center={position} zoom={13} style={{ width: "80%", height: "80%" }}>
    <TileLayer
      url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
      attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
    />
    <Marker position={position}>
      <Popup>
        <span>{markerText}</span>
      </Popup>
    </Marker>
  </Map>
);

WidgetMap.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number), // [lat, long]
  markerText: PropTypes.string // popup text
};
WidgetMap.defaultProps = {
  position: [51.505, -0.09],
  markerText: "This is a demo"
};
export default WidgetMap;
