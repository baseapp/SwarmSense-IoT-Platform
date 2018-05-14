/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import { SimpleForm, TextInput, Create } from "admin-on-rest";
import { connect } from "react-redux";

class MeCreate extends React.Component {
  render() {
    return (
      <Create {...this.props} title="Update profile">
        <SimpleForm defaultValue={this.props.current_user} redirect="list">
          <TextInput source="name" />
          <TextInput source="phone" />
          <TextInput source="email" type="email" />
        </SimpleForm>
      </Create>
    );
  }
}
MeCreate = connect(state => {
  return { current_user: state.postLoginInitials.current_user };
})(MeCreate);
export default /**
 * @name MeCreate
 * @example <MeCreate/>
 * @description View for updating the user profile
 */
MeCreate;
