/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import IconMenu from "material-ui/IconMenu";
import IconButton from "material-ui/IconButton";
import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert";
import PropTypes from "prop-types";
import MenuItem from "material-ui/MenuItem";
const WidgetGeneric = props => {
  let show_more_link = props.readOnly && props.moreLink;
  return (
    <div
      className={props.className}
      style={{
        display: "flex",
        flexDirection: "column",
        flexWrap: "nowrap",
        alignItems: "stretch",
        backgroundColor: "white",
        boxSizing: "border",
        // overflowY: "auto",
        height: "100%",
        width: "100%",
        overflowWrap: "break-word",
        ...props.style
      }}
      id={props.id || null}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          margin: "1.5%"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexWrap: "wrap",
            flexGrow: "2"
          }}
        >
          {props.title && <span>{props.title}</span>}
          {props.subtitle && (
            <span style={{ color: "grey" }}>{props.subtitle}</span>
          )}
        </div>
        {!props.readOnly && (
          <div style={{ alignSelf: "flex-end" }}>
            <IconMenu
              iconButtonElement={
                <IconButton touch={true}>
                  <MoreVertIcon />
                </IconButton>
              }
            >
              <MenuItem
                primaryText="Remove"
                onClick={() => props.onRemoveWidget()}
              />
              <MenuItem
                primaryText="Configure"
                onClick={() => props.onConfigure()}
                disabled={props.configuring}
              />
            </IconMenu>
          </div>
        )}
        {show_more_link && props.moreLink}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flexGrow: "2",
          margin: "1.5%"
        }}
      >
        {props.children}
      </div>
    </div>
  );
};
WidgetGeneric.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  id: PropTypes.string,
  // menuItems: PropTypes.arrayOf(PropTypes.element),
  className: PropTypes.string,
  style: PropTypes.object,
  onRemoveWidget: PropTypes.func,
  onConfigure: PropTypes.func,
  readOnly: PropTypes.bool,
  configuring: PropTypes.bool,
  moreLink: PropTypes.element //In readOnly mode, if this prop is provided, it will render in place of the icon-menu.
};
WidgetGeneric.defaultProps = {
  onRemoveWidget: f => f,
  onConfigure: f => f,
  readOnly: true
};
export default WidgetGeneric;
