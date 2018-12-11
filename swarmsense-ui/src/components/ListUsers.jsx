/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import {
  List,
  Datagrid,
  EmailField,
  TextField,
  FunctionField,
  BooleanField
} from "admin-on-rest";
import { Responsive } from "admin-on-rest";
import { connect } from "react-redux";
import { SimpleList, LoginAs, ActionPanel } from "./index";
import EditButton from "./EditButton";
import { set_params } from "../utils";
import UserFilter from "./FilterUser_name";
import PostPagination from "./PostPagination";
let UserList = props => {
  return (
    <List
      {...props}
      perPage={30}
      title="System-wide users"
      filters={<UserFilter />}
      actions={<ActionPanel />}
      pagination={<PostPagination />}
    >
      <Responsive
        small={
          <SimpleList
            primaryText={record => `${record.name}`}
            secondaryText={record => `${record.email} (Ph: ${record.phone})`}
            editItems={!props.readOnly}
            onEditItem={record => set_params("user", record)}
          />
        }
        medium={
          <Datagrid>
            <TextField source="name" />
            <EmailField source="email" />
            <BooleanField
              source="is_verified"
              style={{ textAlign: "center" }}
              headerStyle={{ textAlign: "center" }}
            />
            <EditButton onClick={record => set_params("user", record)} />
            {props.admin && (
              <FunctionField
                source="options"
                sortable={false}
                render={({ id }) => {
                  if (props.admin) {
                    return <LoginAs uid={id} />;
                  } else {
                    return <div />;
                  }
                }}
              />
            )}
          </Datagrid>
        }
      />
    </List>
  );
};

UserList = connect(state => ({
  admin:
    state.postLoginInitials.current_user.role === "super_admin" ? true : false
}))(UserList); //connected component
export default /**
 * @name UserList
 * @description stateless react component to render list of users
 * @example <UserList/>
 */
UserList;
