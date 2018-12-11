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
import { SimpleList } from "./index";
import PostPagination from "./PostPagination";

const MetadataList = props => (
  <List {...props} title="User settings" pagination={<PostPagination />}>
    <Responsive
      small={
        <SimpleList primaryText={record => `${record.key} : ${record.value}`} />
      }
      medium={
        <Datagrid>
          <TextField source="id" />
          <TextField source="key" />
          <TextField source="value" />
        </Datagrid>
      }
    />
  </List>
);
export default /**
 * @name MetadataList
 * @example <MetadataList/>
 * @description View for listing the user specific metadata such
 * as default_company, etc.
 */
MetadataList;
