/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import PropTypes from "prop-types";
import Leaflet from "leaflet";
import LinearProgress from "material-ui/LinearProgress";
import "leaflet/dist/leaflet.css";
import { Map, Marker, Popup, TileLayer } from "react-leaflet";
import "./map_iterator.css";
import { set_params } from "../../utils";
// import gen_coords from 'random-coordinates';

Leaflet.Icon.Default.imagePath = "/images/";

class MapIterator extends React.Component {
  constructor(props) {
    super(props);
    this.state = { bounds: null };
  }
  componentDidMount() {
    try {
      let fg = new Leaflet.featureGroup(
        this.props.ids
          .filter(
            x =>
              this.props.data[x].location_lat &&
              this.props.data[x].location_long
          )
          .map(x => {
            return Leaflet.marker([
              this.props.data[x].location_lat,
              this.props.data[x].location_long
            ]);
          })
      );
      // console.log("fg", fg);
      let bounds = fg.getBounds();
      // console.log("bounds", bounds);
      this.setState({ ...this.state, bounds });
    } catch (e) {
      console.log("Error while bounding map for sensors.");
      throw e;
      // console.log("error:", e.message);
    }
  }
  render() {
    if (this.props.ids.length > 0 && this.state.bounds) {
      let { data, ids } = this.props;
      return (
        <div style={{ padding: "20px" }}>
          <Map bounds={this.state.bounds}>
            <TileLayer
              url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
              attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
            />
            {ids
              .filter(id => {
                let { location_lat: lat, location_long: long } = data[id];
                // console.log(lat, long, "inside filter", id, data[id])
                if (lat && long) {
                  return true;
                } else {
                  return false;
                }
              })
              .map(id => {
                let {
                  location_lat: _lat,
                  location_long: _long,
                  name,
                  is_down,
                  id: sid,
                  type,
                  key: skey
                } = data[id];
                let pos = [Number.parseFloat(_lat), Number.parseFloat(_long)];
                let icon = null;
                // console.log(id, _lat, _long)
                if (!is_down) {
                  icon = Leaflet.icon({
                    iconUrl: "/images/marker-icon.png",
                    iconSize: [15, 20]
                    // iconAnchor: [22, 94],
                    // popupAnchor: [-3, -76],
                  });
                } else {
                  icon = Leaflet.icon({
                    iconUrl: "/images/marker-red.png",
                    iconSize: [15, 20]
                    // iconAnchor: [22, 94],
                    // popupAnchor: [-3, -76],
                  });
                }
                return (
                  <Marker position={pos} key={id} icon={icon}>
                    <Popup>
                      <span>
                        <a
                          href={`#/sensor_chart`}
                          onClick={() => set_params("sensor", data[id])}
                        >
                          {name}
                        </a>
                      </span>
                    </Popup>
                  </Marker>
                );
              })}
          </Map>
        </div>
      );
    } else {
      return null;
    }
  }
}

MapIterator.propTypes = {
  data: PropTypes.object,
  ids: PropTypes.array
};

export default /**
@name MapIterator
@example <MapIterator/>
@description AOR based custom iterator for the suitable
  List component like SensorsByTypeMap, etc. Uses leaflet.js and react-leaflet.
*/
MapIterator;
