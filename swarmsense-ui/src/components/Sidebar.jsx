/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import compose from "recompose/compose";
import Drawer from "material-ui/Drawer";
import Paper from "material-ui/Paper";
import muiThemeable from "material-ui/styles/muiThemeable";

import {
  Responsive,
  setSidebarVisibility as setSidebarVisibilityAction
} from "admin-on-rest";

const getWidth = width => (typeof width === "number" ? `${width}px` : width);

const getStyles = ({ drawer }) => {
  const width = drawer && drawer.width ? getWidth(drawer.width) : "16em";

  return {
    sidebarOpen: {
      flex: `0 0 ${width}`,
      marginLeft: 0,
      order: -1,
      transition: "margin 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms"
    },
    sidebarClosed: {
      flex: `0 0 ${width}`,
      marginLeft: `-${width}`,
      order: -1,
      transition: "margin 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms"
    }
  };
};

// We shouldn't need PureComponent here as it's connected
// but for some reason it keeps rendering even though mapStateToProps returns the same object
class Sidebar extends PureComponent {
  constructor(props) {
    super(props);
    this.handleClose = this.handleClose.bind(this);
  }
  handleClose = () => {
    this.props.setSidebarVisibility(false);
  };
  _Drawer(props) {
    const {
      open,
      setSidebarVisibility,
      children,
      handleClose,
      muiTheme
    } = props;
    const styles = getStyles(muiTheme);
    window.application.drawer_menu_enabled = true;
    return (
      <Drawer docked={false} open={open} onRequestChange={setSidebarVisibility}>
        {React.cloneElement(children, {
          onMenuTap: handleClose
        })}
      </Drawer>
    );
  }
  _NDrawer(props) {
    const { open, setSidebarVisibility, children, muiTheme } = props;
    const styles = getStyles(muiTheme);
    window.application.drawer_menu_enabled = false;
    return (
      <Paper style={open ? styles.sidebarOpen : styles.sidebarClosed}>
        {React.cloneElement(children, {
          onMenuTap: () => null
        })}
      </Paper>
    );
  }
  render() {
    const { open, setSidebarVisibility, children, muiTheme } = this.props;
    return (
      <Responsive
        small={<this._Drawer {...this.props} handleClose={this.handleClose} />}
        medium={<this._NDrawer {...this.props} />}
      />
    );
  }
}

Sidebar.propTypes = {
  children: PropTypes.node.isRequired,
  muiTheme: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  setSidebarVisibility: PropTypes.func.isRequired
};

const mapStateToProps = (state, props) => ({
  open: state.admin.ui.sidebarOpen,
  locale: state.locale, // force redraw on locale change
  theme: props.theme // force redraw on theme changes
});

export default compose(
  muiThemeable(),
  connect(mapStateToProps, {
    setSidebarVisibility: setSidebarVisibilityAction
  })
)(Sidebar);
