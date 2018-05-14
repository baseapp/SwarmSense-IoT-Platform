/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import { connect } from "react-redux";
import TextField from "material-ui/TextField";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";
import FlatButton from "material-ui/FlatButton";
import { Responsive, ViewTitle, showNotification } from "admin-on-rest";
import { Card, CardText, CardTitle, CardActions } from "material-ui/Card";
import isequal from "lodash.isequal";
import {
  WithLogin,
  SwitchCompany as CompanySwitcher,
  SwitchLocale as LocaleSwitcher
} from "./index";
import { set_current_user, set_meta_data } from "../actions";
import { setCurrentUser, setMetaData } from "../rest";
class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = { edit: false };
    this.initial_props = this.props.profile;
  }
  reset_metadata() {
    this.props.dispatch(set_meta_data(this.initial_props.meta_data));
  }
  save_finished_generator(total_async_calls, callback) {
    let async_calls_done = 0;
    return () => {
      async_calls_done++;
      if (total_async_calls === async_calls_done) {
        callback();
      }
    };
  }
  failed_save(err, id) {
    this.props.dispatch(
      showNotification(`User not updated - ${err.message}`, "warning")
    );
    this.reset();
  }
  save() {
    let { current_user, meta_data } = this.props.profile;
    let total_async_calls = 2;
    if (isequal(current_user, this.initial_props.current_user)) {
      total_async_calls -= 1;
    }
    if (isequal(meta_data, this.initial_props.meta_data)) {
      total_async_calls -= 1;
    }
    if (total_async_calls > 0) {
      this.props.dispatch(showNotification("Saving..."));
    } else {
      this.props.dispatch(showNotification("Please change fields to update."));
    }
    let done_counter = this.save_finished_generator(total_async_calls, () => {
      this.props.dispatch(showNotification("User updated!"));
    });
    // alert("Yet to implement. Check back later!")
    if (!isequal(current_user, this.initial_props.current_user)) {
      //save current_user
      setCurrentUser(current_user)
        .then(d => {
          done_counter();
          this.initial_props.current_user = this.props.profile.current_user;
        })
        .catch(err => {
          this.failed_save(err, 1);
        });
    }
    if (!isequal(meta_data, this.initial_props.meta_data)) {
      //save meta_data
      let nmd = [];
      Object.getOwnPropertyNames(meta_data).map(key => {
        let d = { key, value: meta_data[key] };
        nmd.push(d);
        return null;
      });
      nmd = nmd.filter(d => {
        if (this.initial_props.meta_data[d.key] === d.value) {
          return false;
        } else {
          return true;
        }
      });
      setMetaData(nmd)
        .then(d => {
          done_counter();
          this.initial_props.meta_data = this.props.profile.meta_data;
        })
        .catch(err => {
          this.failed_save(err, 2);
        });
    }
  }
  reset(ids = -1) {
    switch (ids) {
      case 1:
        this.props.dispatch(set_current_user(this.initial_props.current_user));
        break;
      case 2:
        this.props.dispatch(set_meta_data(this.initial_props.meta_data));
        break;
      case -1:
      default:
        this.props.dispatch(set_current_user(this.initial_props.current_user));
        this.props.dispatch(set_meta_data(this.initial_props.meta_data));
    }
  }
  render() {
    let mobile_view, non_mobile_view;
    mobile_view = non_mobile_view = (
      <div>
        <Card>
          <ViewTitle title="Profile" />
          <CardText>
            <div>
              <TextField
                floatingLabelText="Role"
                disabled
                value={this.props.profile.current_user.role}
              />
              <br />
              <TextField
                floatingLabelText="Name"
                value={this.props.profile.current_user.name}
                onChange={(e, v) => {
                  this.props.dispatch(
                    set_current_user({
                      ...this.props.profile.current_user,
                      name: v
                    })
                  );
                }}
              />
              <br />
              <TextField
                floatingLabelText="Phone"
                value={this.props.profile.current_user.phone}
                onChange={(e, v) => {
                  this.props.dispatch(
                    set_current_user({
                      ...this.props.profile.current_user,
                      phone: v
                    })
                  );
                }}
              />
              <br />
              <TextField
                floatingLabelText="Email"
                value={this.props.profile.current_user.email}
                onChange={(e, v) => {
                  this.props.dispatch(
                    set_current_user({
                      ...this.props.profile.current_user,
                      email: v
                    })
                  );
                }}
              />
              <br />
              <TextField
                floatingLabelText="Address: Line-1"
                value={this.props.profile.meta_data.address_line1 || ""}
                onChange={(e, v) => {
                  this.props.dispatch(
                    set_meta_data({
                      ...this.props.profile.meta_data,
                      address_line1: v
                    })
                  );
                }}
              />
              <br />
              <TextField
                floatingLabelText="Address: Line-2"
                value={this.props.profile.meta_data.address_line2 || ""}
                onChange={(e, v) => {
                  this.props.dispatch(
                    set_meta_data({
                      ...this.props.profile.meta_data,
                      address_line2: v
                    })
                  );
                }}
              />
              <br />
              <TextField
                floatingLabelText="City"
                value={this.props.profile.meta_data.address_city || ""}
                onChange={(e, v) => {
                  this.props.dispatch(
                    set_meta_data({
                      ...this.props.profile.meta_data,
                      address_city: v
                    })
                  );
                }}
              />
              <br />
              <TextField
                floatingLabelText="State"
                value={this.props.profile.meta_data.address_state || ""}
                onChange={(e, v) => {
                  this.props.dispatch(
                    set_meta_data({
                      ...this.props.profile.meta_data,
                      address_state: v
                    })
                  );
                }}
              />
              <br />
              <TextField
                floatingLabelText="Country"
                value={this.props.profile.meta_data.address_country || ""}
                onChange={(e, v) => {
                  this.props.dispatch(
                    set_meta_data({
                      ...this.props.profile.meta_data,
                      address_country: v
                    })
                  );
                }}
              />
              <br />
            </div>
          </CardText>
          <CardActions>
            <FlatButton label="Save" onClick={() => this.save()} primary />
            <FlatButton
              label="Reset"
              onClick={() => this.reset()}
              primary
              disabled={
                isequal(this.props.profile, this.initial_props) ? true : false
              }
            />
          </CardActions>
        </Card>
        <Card>
          <CardTitle title="Settings" />
          <CardActions>
            <CompanySwitcher />
            <LocaleSwitcher />
          </CardActions>
        </Card>
      </div>
    );
    return (
      <WithLogin>
        <Responsive medium={non_mobile_view} small={mobile_view} />
      </WithLogin>
    );
  }
}

Profile = connect(state => {
  return { profile: state.postLoginInitials };
})(Profile);

export default Profile;
