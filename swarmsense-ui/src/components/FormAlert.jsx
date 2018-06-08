/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import {
  SimpleForm,
  TextInput,
  BooleanInput,
  SelectInput
} from "admin-on-rest";
import { DependentInput } from "aor-dependent-input";
import FieldConfigSelector from "./FieldConfigSelector";
import { change } from "redux-form";
import {
  FieldTimePicker,
  FieldWebhookPayload,
  FieldAlertType
} from "./index.js";
import { extract_time, parse_time } from "../utils";

import { Field } from "redux-form";
import isequal from "lodash.isequal";
import FlatButton from "material-ui/FlatButton";
import Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import { Map, Polygon, TileLayer } from "react-leaflet";
import "./input_lat_lng/leaflet.css";

/**
 * A custom {@link https://marmelab.com/admin-on-rest/Inputs.html#writing-your-own-input-component|input} component to draw a polygon on a map.
 * @extends React.Component
 */

class InputMapPolygon extends React.Component {
  constructor(props) {
    super(props);
    let latlngs = this.props.input.value || [];
    let bounds = {},
      bounds_set = false;
    if (this.props.view === "edit" && latlngs.length > 2) {
      bounds = new Leaflet.latLngBounds(
        latlngs.map(latlng => Leaflet.latLng(latlng))
      );
      bounds_set = true;
    }
    this.setInitialLatlngs(latlngs, bounds_set);
    this.state = {
      set_fence: false,
      latlngs,
      bounds,
      bounds_set
      // zoom: 3
    };
  }
  setInitialLatlngs(latlngs, bounds_set) {
    this.initial_latlngs = latlngs;
    this.initial_bounds_set = bounds_set;
  }
  componentWillReceiveProps(newProps) {
    let latlngs = newProps.input.value,
      bounds = {},
      bounds_set = false;
    if (this.props.view === "edit" && latlngs.length > 2) {
      bounds = new Leaflet.latLngBounds(
        latlngs.map(latlng => Leaflet.latLng(latlng))
      );
      bounds_set = true;
    }
    this.setState({ ...this.state, latlngs, bounds, bounds_set });
  }

  /**
   * clickHandler - Handles the click on the map.
   *
   * @param  {Object} ev Event object passed on clicking.
   */

  clickHandler(ev) {
    if (this.state.set_fence) {
      let { latlng: { lat: new_lat, lng: new_long }, target } = ev,
        latlngs = this.state.latlngs.slice();
      // ,{ zoom } = this.state;
      latlngs.push([new_lat, new_long]);
      this.props.input.onChange(latlngs);
      // if (zoom !== target.getZoom()) {
      //   this.setState({ ...this.state, zoom });
      // }
      // this.setState({ ...this.state, latlngs });
    }
  }

  /**
   * toggleFence - hide-show the polygon.
   *
   */

  toggleFence() {
    this.setState({ ...this.state, set_fence: !this.state.set_fence });
  }
  /**
   * resetFence - resets the polygon to the initial settings.
   *
   */
  resetFence() {
    this.setState({
      ...this.state,
      latlngs: this.initial_latlngs,
      bounds_set: this.initial_bounds_set
    });
  }
  /**
   * removeFence - removes the drawn polygon.
   *
   */

  removeFence() {
    this.setState({ ...this.state, latlngs: [], bounds_set: false });
  }

  /**
   * renderMap - Makes map for the user client.
   *
   * @return {React.Node} Map for the user client.
   */

  renderMap() {
    let map = undefined;
    if (this.state.bounds_set) {
      map = (
        <Map bounds={this.state.bounds} onClick={ev => this.clickHandler(ev)}>
          <TileLayer
            url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
          />
          <Polygon positions={this.state.latlngs} />
        </Map>
      );
    } else {
      map = (
        <Map
          center={[28.5166866, 77.16438531]}
          zoom={3}
          onClick={ev => this.clickHandler(ev)}
        >
          <TileLayer
            url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
          />
          <Polygon positions={this.state.latlngs} />
        </Map>
      );
    }
    return map;
  }
  render() {
    return (
      <div>
        <FlatButton
          label={this.state.set_fence ? "Done" : "Update fence"}
          onClick={() => this.toggleFence()}
          secondary
        />
        <FlatButton
          disabled={!this.state.set_fence || this.state.latlngs.length === 0}
          label="Remove fencing"
          onClick={() => this.removeFence()}
          primary
        />
        <FlatButton
          disabled={
            !this.state.set_fence ||
            isequal(this.state.latlngs, this.initial_latlngs)
          }
          label="Reset fencing"
          onClick={() => this.resetFence()}
          secondary
        />
        {this.renderMap()}
      </div>
    );
  }
}

export default /**
 * FormAlert - Makes the form for creating/editing alert.
 *
 * @param  {Object} props
 * @return {React.Node} A SimpleForm based form.
 */

function FormAlert(props) {
  return (
    <SimpleForm
      {...props}
      redirect="list"
      defaultValue={() => ({
        between_start: "",
        between_end: "",
        sensor_type: null,
        web_hooks: [],
        recipients: [],
        type: "",
        polygon: []
      })}
      onChange={(e, dispatch) => {
        if (e["type"] && e.type === "inactivity") {
          dispatch(change("record-form", "action_type", "notification"));
        }
      }}
    >
      <FieldAlertType />
      <DependentInput
        dependsOn="type"
        resolve={type => (type === "geofencing" ? true : false)}
      >
        <Field
          name="polygon"
          component={InputMapPolygon}
          view={props["view"] || "non-edit"}
        />
      </DependentInput>
      <DependentInput
        dependsOn="type"
        resolve={type => (type === "geofencing" ? true : false)}
      >
        <SelectInput
          source="alert_if"
          label="Alert when"
          optionText="key"
          optionValue="value"
          choices={[
            { key: "Inside Fence", value: "inside" },
            { key: "Outside Fence", value: "outside" }
          ]}
        />
      </DependentInput>
      <DependentInput
        dependsOn="type"
        resolve={type => (type === "geofencing" ? false : true)}
      >
        <TextInput source="value" />
      </DependentInput>
      <TextInput source="name" />
      <TextInput source="alert_text" />
      <BooleanInput source="is_active" label="Is Active" />
      <TextInput source="snooze" />
      <DependentInput
        dependsOn="type"
        resolve={type => (type === "inactivity" ? false : true)}
      >
        <SelectInput
          label="Select action type"
          source="action_type"
          choices={[
            { label: "Notify users", value: "notification" },
            { label: "Trigger an action", value: "trigger" }
          ]}
          optionText="label"
          optionValue="value"
        />
      </DependentInput>
      <DependentInput dependsOn="action_type" value="notification">
        <TextInput
          source="recipients"
          parse={v => v.split(",").map(ob => ob.trim())}
          format={v => v.join(", ")}
        />
        <TextInput source="web_hooks[0].url" label="Webhook(Url)" />
        <FieldWebhookPayload addLabel label="Add url payload" />
      </DependentInput>
      <DependentInput dependsOn="action_type" value="trigger">
        <FieldConfigSelector />
      </DependentInput>
      <FieldTimePicker
        source="between_start"
        hintText="Start time"
        format={v => parse_time(v)}
        parse={v => extract_time(v)}
      />
      <br />
      <FieldTimePicker
        source="between_end"
        hintText="End time"
        format={v => parse_time(v)}
        parse={v => extract_time(v)}
      />
    </SimpleForm>
  );
}
