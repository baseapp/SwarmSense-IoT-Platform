/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import { List, Responsive, TextField, Datagrid } from "admin-on-rest";
import { SimpleList } from "./index";
import EditButton from "./EditButton";
import { set_params } from "../utils";
const SettingsList = props => {
  const FakePagin = props => <div />; // for disabling pagination in List view
  return (
    <List
      {...props}
      perPage={100}
      pagination={<FakePagin />}
      sort={{ order: "ASC", field: "group" }}
    >
      {permissions => {
        const editItems = permissions === "read" ? false : true;
        return (
          <Responsive
            small={
              <SimpleList
                onEditItem={record => set_params("setting", record)}
                editItems={editItems}
                primaryText={record =>
                  `${record.label} | ${record.value.slice(0, 10) + " ..."}`
                }
                secondaryText={({ description, group, access }) =>
                  `Desc.: ${description} [${access}/${group}]`
                }
              />
            }
            medium={
              <Datagrid>
                <TextField source="label" />
                <TextField source="description" />
                <TextField source="value" />
                <TextField source="group" />
                <TextField source="access" />
                {editItems && (
                  <EditButton
                    onClick={record => set_params("setting", record)}
                  />
                )}
              </Datagrid>
            }
          />
        );
      }}
    </List>
  );
};
export default /**
 * @name SettingsList
 * @description React functional component for listing all the system-wide settings
 * @example <SettingsList/>
 */
SettingsList;
