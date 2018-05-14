/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import { List } from "admin-on-rest";
import { Responsive } from "admin-on-rest";
import { Card, CardActions, CardTitle } from "material-ui/Card";
import {
  SimpleList,
  ActionPanel,
  SwitchCompany as CompanySwitcher,
  SwitchLocale as LocaleSwitcher
} from "./index";
/**
 * @name UserProfile
 * @description A react component representing the user profile.
 * @example <UserProfile/>
 */
let UserProfile = props => {
  if (props.ids.length > 0) {
    return (
      <div style={{ marginLeft: "24px", paddingBottom: "20px" }}>
        {props.ids.map(id => {
          return (
            <div key={id}>
              <div>
                <span>Profile - </span>
                <a href={`mailto:${props.data[id].email}`}>
                  {props.data[id].name}
                </a>
                <span>
                  {` ( Phone-num.: ${
                    props.data[id].phone ? props.data[id].phone : "n/a"
                  } )`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  } else {
    return null;
  }
};
const Noop = props => null;

const MeList = props => (
  <div>
    <div style={{ marginBottom: "15px" }}>
      <List
        {...props}
        title=" "
        pagination={<Noop />}
        actions={
          <ActionPanel
            createButtonOverride={{
              label: "Edit profile",
              href: "#/me/create",
              primary: true
            }}
          />
        }
      >
        <Responsive
          small={
            <SimpleList
              primaryText={record => `Name : ${record.name}`}
              secondaryText={record => `Email : ${record.email}`}
              editItems={false}
            />
          }
          medium={<UserProfile />}
        />
      </List>
    </div>
    <div>
      <Card>
        <CardTitle>Settings</CardTitle>
        <CardActions>
          <CompanySwitcher />
          <LocaleSwitcher />
        </CardActions>
      </Card>
    </div>
  </div>
);
export default /**
 * @name MeList
 * @example <MeList/>
 * @description It is the view for listing the current user's profile
 */
MeList;
