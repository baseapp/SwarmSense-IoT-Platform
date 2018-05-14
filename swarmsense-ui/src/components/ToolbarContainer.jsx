/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import { Toolbar, ToolbarGroup, ToolbarTitle } from "material-ui/Toolbar";
import PropTypes from "prop-types";
import IconMenu from "material-ui/IconMenu";
import NavigationExpandMoreIcon from "material-ui/svg-icons/navigation/expand-more";
import IconButton from "material-ui/IconButton";
import { ViewTitle } from "admin-on-rest";
import { get_logger } from "../utils";

/**
 * ToolbarContainer - A generic React component to render a view with a material-ui's Toolbar and
 * other react elements as children.
 *
 * @param  {Object} props Various props passed by parent component.
 * @return {Object} A react element.
 */

class ToolbarContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { offsetWidth: 0, resize_event: false };
    this.logger = get_logger("ToolbarContainer");
    this.setOffsetWidth = this.setOffsetWidth.bind(this);
    this.addResizeEvent = this.addResizeEvent.bind(this);
    this.removeResizeEvent = this.removeResizeEvent.bind(this);
  }
  addResizeEvent(callback) {
    window.addEventListener("resize", callback);
  }
  removeResizeEvent(callback) {
    window.removeEventListener("resize", callback);
  }
  render_toolbar() {
    let props = this.props,
      // _t = "small",
      toolbar = <this.props.smallScreenToolbar title={props.title} />;
    if (this.state.offsetWidth >= 768) {
      // _t = "big";
      toolbar = (
        <Toolbar className="toolbar" {...props.toolbarProps}>
          <ToolbarGroup firstChild={true}>
            <ToolbarTitle
              text={props.title}
              style={{ color: "black", marginLeft: "10px" }}
            />
          </ToolbarGroup>
          {props.menuItems && (
            <ToolbarGroup className="icon-menu-bar">
              <IconMenu
                iconButtonElement={
                  <IconButton touch={true}>
                    <NavigationExpandMoreIcon />
                  </IconButton>
                }
              >
                {props.menuItems.map((menuItem, id) => {
                  return React.cloneElement(menuItem, { key: id });
                })}
              </IconMenu>
            </ToolbarGroup>
          )}
        </Toolbar>
      );
    }
    // this.logger("@render_toolbar", _t);
    return toolbar;
  }
  setOffsetWidth() {
    let offsetWidth = window.document.body.offsetWidth;
    // this.logger("@setOffsetWidth: offsetWidth", offsetWidth);
    this.setState({
      ...this.state,
      offsetWidth
    });
  }

  componentDidMount() {
    this.setOffsetWidth();
    this.addResizeEvent(this.setOffsetWidth);
  }
  componentWillUnmount() {
    this.removeResizeEvent(this.setOffsetWidth);
  }
  render() {
    let props = this.props;
    return (
      <div className="toolbar-container" id={props.id} style={props.style}>
        {this.render_toolbar()}
        {props.children}
      </div>
    );
  }
}

ToolbarContainer.propTypes = {
  id: PropTypes.string.isRequired,
  toolbarProps: PropTypes.object,
  title: PropTypes.string.isRequired,
  menuItems: PropTypes.arrayOf(PropTypes.element),
  smallScreenToolbar: PropTypes.func, // A dumb component which takes title
  style: PropTypes.object // style of the .toolbar-container
};
ToolbarContainer.defaultProps = {
  toolbarProps: {
    style: {}
  },
  smallScreenToolbar: ViewTitle,
  style: {
    backgroundColor: "rgb(237, 236, 236)"
  }
};
export default ToolbarContainer;
