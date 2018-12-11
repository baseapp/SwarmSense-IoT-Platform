/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import { List, Datagrid, TextField } from "admin-on-rest";
import { Responsive } from "admin-on-rest";
import EditButton from "./EditButton";
import { SimpleList, ActionPanel } from "./index";
import { set_params } from "../utils";
import PostPagination from "./PostPagination";

/**
 * @example <CompaniesList/>
 * @description View to list all the companies of current user
 */
class CompaniesList extends React.Component {
  render() {
    return (
      <List {...this.props} perPage={10} actions={<ActionPanel />} pagination={<PostPagination />}>
        {permissions => {
          // console.log("permissions", permissions);
          let editItems = permissions === "read" ? false : true;
          return (
            <Responsive
              small={
                <SimpleList
                  onEditItem={record => set_params("company", record)}
                  editItems={editItems}
                  primaryText={record => `${record.name}( ${record.id} )`}
                  secondaryText={record => `${record.owner_id}`}
                />
              }
              medium={
                <Datagrid {...this.props}>
                  <TextField source="name" />
                  {/*<EmailField source="owner_id" />*/}
                  <TextField source="key" />
                  {editItems && (
                    <EditButton
                      onClick={record => set_params("company", record)}
                    />
                  )}
                </Datagrid>
              }
            />
          );
        }}
      </List>
    );
  }
}
export default CompaniesList;
