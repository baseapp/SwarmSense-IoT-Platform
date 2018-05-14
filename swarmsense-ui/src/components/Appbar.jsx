/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarTitle,
  ToolbarSeparator
} from "material-ui/Toolbar";
import muiThemeable from "material-ui/styles/muiThemeable";
import compose from "recompose/compose";
import { toggleSidebar as toggleSidebarAction } from "admin-on-rest/lib/actions";
import IconButton from "material-ui/IconButton";
import IconMenu from "material-ui/IconMenu";
import ActionViewHeadline from "material-ui/svg-icons/action/view-headline";
import { cyan500 } from "material-ui/styles/colors";
import MenuItem from "material-ui/MenuItem";
import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert";
/**
 * @name AppBar
 * @description A react functional component representing the top bar with
 * title and toggler to control sidebar
 * @param {Object} configObject configuration for building the bar
 * @param {String} configObject.title title of the bar
 * @param {Function} configObject.toggleSidebar function to control the side-bar
 * @returns {Object} A react component(material-ui's Toolbar) representing the bar.
 */
class AppBar extends React.Component {
  render() {
    let {
        title,
        toggleSidebar,
        globalCompanyName,
        loading,
        userName = ""
      } = this.props,
      company_name = globalCompanyName || "";
    if (loading > 0) {
      loading = true;
    } else {
      loading = false;
    }
    return (
      <Toolbar style={{ backgroundColor: cyan500, color: "white" }}>
        <ToolbarGroup firstChild={true}>
          <IconButton onClick={toggleSidebar} style={{ marginLeft: "4px" }}>
            <ActionViewHeadline color="white" />
          </IconButton>
          <ToolbarTitle
            text={title}
            style={{ color: "white", fontSize: "1.8em" }}
          />
        </ToolbarGroup>
        {!loading && (
          <ToolbarGroup lastChild={true} style={{ marginRight: "6px" }}>
            <ToolbarTitle text={`Hello ${userName}, ${company_name}`} />
            <ToolbarSeparator />
            <IconMenu
              iconButtonElement={
                <IconButton>
                  <MoreVertIcon />
                </IconButton>
              }
            >
              <MenuItem
                primaryText="Account"
                onClick={() => this.context.router.history.push("/profile")}
              />
              <MenuItem
                primaryText="Logout"
                onClick={() => {
                  sessionStorage.clear();
                  localStorage.clear();
                  this.context.router.history.push("/login");
                }}
              />
            </IconMenu>
          </ToolbarGroup>
        )}
      </Toolbar>
    );
  }
}
// Appbar.contextTypes = {
//   router: PropTypes.object
// };
AppBar.propTypes = {
  // isLoading: PropTypes.bool,
  // loaderStyle: PropTypes.object,
  // logout: PropTypes.oneOfType([
  //   PropTypes.node,
  //   PropTypes.func,
  //   PropTypes.string
  // ]),
  title: PropTypes.oneOfType([
    PropTypes.string
    // PropTypes.element
  ]).isRequired,
  toggleSidebar: PropTypes.func.isRequired,
  globalCompanyName: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
  loading: PropTypes.number
};
AppBar.defaultProps = {
  globalCompanyName: ""
};
AppBar.contextTypes = {
  router: PropTypes.object
};
const enhance = compose(
  muiThemeable(), // force redraw on theme change
  connect(
    state => {
      return {
        globalCompanyName: state.postLoginInitials.global_company.name,
        userName: state.postLoginInitials.current_user.name,
        loading: state.admin.loading
      };
    },
    dispatch => {
      return {
        toggleSidebar: () => {
          if (
            window.location.hash.includes("cdash/") ||
            window.location.hash === "#/"
          ) {
            let resize_event = new Event("resize", { bubbles: true });
            window.dispatchEvent(resize_event);
          }
          dispatch(toggleSidebarAction());
        }
      };
    }
  )
);

export default /**
@name Appbar
@example <Appbar/>
*/
enhance(AppBar);
