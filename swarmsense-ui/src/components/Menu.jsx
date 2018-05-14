/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import MenuItem from "material-ui/MenuItem";
import { Link } from "react-router-dom";
import Divider from "material-ui/Divider";
import ArrowDropRight from "material-ui/svg-icons/navigation-arrow-drop-right";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import UsersIcon from "material-ui/svg-icons/social/group";
import AlertIcon from "material-ui/svg-icons/social/notifications";
import UserIcon from "material-ui/svg-icons/social/person-outline";
import DashboardIcon from "material-ui/svg-icons/navigation/apps";
import SensorsIcon from "material-ui/svg-icons/image/grain";
import NetworkIcon from "material-ui/svg-icons/hardware/device-hub";
import SensorTypesIcon from "material-ui/svg-icons/hardware/router";
import CompaniesIcon from "material-ui/svg-icons/action/account-balance";
import WebSettingsIcon from "material-ui/svg-icons/action/settings-applications";
import AdminIcon from "material-ui/svg-icons/action/event-seat";
import { cyan300 } from "material-ui/styles/colors";
import CustomDashboardIcon from "material-ui/svg-icons/action/dashboard";
class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = { is_admin: false, is_loading: true };
  }
  signedIn() {
    return sessionStorage.getItem("token");
  }
  render() {
    if (this.props.configuring) {
      return null;
    }
    if (!this.signedIn()) {
      return (
        <div>
          <MenuItem primaryText="Login" href="#/login" />
          <MenuItem primaryText="Signup" href="#/signup" />
          <MenuItem primaryText="Reset password" href="#/forgot-password" />
        </div>
      );
    }
    let { onMenuTap, logout } = this.props;
    let sensor_href = "#/company_sensors";
    let network_href = "#/company_networks";
    let admin_section = !this.props.admin ? (
      ""
    ) : (
      <MenuItem
        primaryText="Admin"
        rightIcon={<ArrowDropRight />}
        leftIcon={<AdminIcon color={cyan300} />}
        menuItems={[
          <MenuItem
            href="/#/users"
            primaryText="Manage Users"
            onClick={onMenuTap}
            leftIcon={<UsersIcon color={cyan300} />}
          />,
          <MenuItem
            href="/#/companies"
            primaryText="Manage Companies"
            onClick={onMenuTap}
            leftIcon={<CompaniesIcon color={cyan300} />}
          />,
          <MenuItem
            href="/#/sensor_types"
            primaryText="Manage Sensor Types"
            onClick={onMenuTap}
            leftIcon={<SensorTypesIcon color={cyan300} />}
          />,
          <MenuItem
            href="/#/settings"
            primaryText="Admin Settings"
            onClick={onMenuTap}
            leftIcon={<WebSettingsIcon color={cyan300} />}
          />
        ]}
      />
    );
    return (
      <div>
        <MenuItem
          containerElement={<Link to="" />}
          primaryText="Home"
          onClick={onMenuTap}
          leftIcon={<DashboardIcon color={cyan300} />}
        />
        <MenuItem
          href={sensor_href}
          primaryText="Devices"
          onClick={onMenuTap}
          leftIcon={<SensorsIcon color={cyan300} />}
        />
        <MenuItem
          href={network_href}
          primaryText="Networks"
          onClick={onMenuTap}
          leftIcon={<NetworkIcon color={cyan300} />}
        />
        <MenuItem
          href="/#/company_alerts"
          primaryText="Alerts"
          onClick={onMenuTap}
          leftIcon={<AlertIcon color={cyan300} />}
        />
        <MenuItem
          href="/#/my_dashboards"
          primaryText="Dashboards"
          onClick={onMenuTap}
          leftIcon={<CustomDashboardIcon color={cyan300} />}
        />
        <MenuItem
          href="/#/company_users"
          primaryText="Users"
          onClick={onMenuTap}
          leftIcon={<UsersIcon color={cyan300} />}
        />
        <MenuItem
          href="/#/companies"
          primaryText="Companies"
          onClick={onMenuTap}
          leftIcon={<CompaniesIcon color={cyan300} />}
        />

        {window.application.drawer_menu_enabled && (
          <MenuItem
            primaryText="Account"
            href="#/profile"
            onClick={onMenuTap}
            leftIcon={<UserIcon color={cyan300} />}
          />
        )}
        {admin_section}
        <Divider />
        {logout}
        <Divider />
        <div style={{ color: "grey", marginTop: "20px", fontSize: "0.9em" }}>
          <div
            style={{
              textAlign: "center",
              marginBottom: "10px",
              fontWeight: "bold"
            }}
          >
            <u>Developer Space</u>
          </div>
          <div>
            <div style={{ textAlign: "center", marginBottom: "10px" }}>
              Build version : {window.application.build_version}
            </div>
          </div>
          <div>
            <div style={{ textAlign: "center", marginBottom: "10px" }}>
              Built on : {window.application.build_on}
            </div>
          </div>
          <div>
            <div style={{ textAlign: "center", marginBottom: "10px" }}>
              :: Change log history ::
            </div>
            <ul>
              {window.application.change_logs.slice(0, 5).map((log, i) => (
                <li
                  key={i}
                  style={{ color: `rgba(${250 - 50 * i},100,100,0.9)` }}
                >
                  {log}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
Menu.contextTypes = {
  router: PropTypes.object
};
let mapStateToProps = state => {
  return {
    company: state.company,
    admin:
      state.postLoginInitials.current_user.role === "super_admin"
        ? true
        : false,
    loginAs: state.postLoginInitials.login_as,
    configuring: state.postLoginInitials.configuring
  };
};
export default /**
 * @name Menu
 * @example <Menu/>
 * @description Class represents the side-bar menu
 */
connect(mapStateToProps)(Menu);
