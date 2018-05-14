/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import PropTypes from "prop-types";
import MenuItem from "material-ui/MenuItem";
import ToolbarContainer from "../ToolbarContainer";
// import "./dashboard.css";
function Dashboard(props) {
  let { id, title, onAddWidget, menuItems, disableAdding } = props,
    menu_items = [
      <MenuItem
        primaryText="Add Widget"
        onClick={() => onAddWidget()}
        disabled={disableAdding}
      />,
      ...menuItems
    ];
  return (
    <ToolbarContainer
      toolbarProps={{ style: { backgroundColor: "white" } }}
      id={id}
      title={title}
      menuItems={menu_items}
    >
      {props.children}
    </ToolbarContainer>
  );
}
Dashboard.propTypes = {
  id: PropTypes.string.isRequired,
  // toolbarProps: PropTypes.object,
  title: PropTypes.string.isRequired,
  menuItems: PropTypes.arrayOf(PropTypes.element),
  onAddWidget: PropTypes.func,
  disableAdding: PropTypes.bool
};
Dashboard.defaultProps = {
  onAddWidget: f => f,
  menuItems: [],
  disableAdding: false
};
export default Dashboard;
