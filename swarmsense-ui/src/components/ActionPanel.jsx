/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import FlatButton from "material-ui/FlatButton";
import PropTypes from "prop-types";
import {
  ListButton,
  ShowButton,
  CreateButton,
  DeleteButton,
  RefreshButton
} from "admin-on-rest";
import { CardActions } from "material-ui/Card";

const cardActionStyle = {
  zIndex: 2,
  display: "inline-block",
  float: "right"
};

/**
 * It can be used to make value of "actions" prop of "List"(admin-on-rest) component.
 * @extends React.Component
 */

class ActionPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { buttons: null };
  }
  componentWillMount() {
    this.setState({ buttons: this.create_buttons() });
  }
  create_buttons() {
    // creates the native buttons, as in the admin-on-rest family & iconMenu
    let type = this.props.view;
    let buttons = [];
    let counter = 0;
    let custom_buttons = this.props.customButtons;
    let make_custom_button_element = props => {
      return <FlatButton {...props} primary={true} />;
    };
    if (custom_buttons.length > 0) {
      custom_buttons.map(ob => {
        if (ob.hasOwnProperty("props")) {
          //A react element
          //buttons.push(ob) /** Issue with key of the element **/
        } else {
          buttons.push(make_custom_button_element({ ...ob, key: ++counter })); // make a custom button
        }
      });
    }
    let {
      basePath,
      data,
      hasDelete,
      hasShow,
      refresh,
      resource,
      filters,
      displayedFilters,
      filterValues,
      hasCreate,
      showFilter,
      listButtonOverride,
      deleteButtonOverride,
      createButtonOverride
    } = this.props;
    const read_only =
      (sessionStorage.getItem("company_role") || "read") === "read"
        ? true
        : false;
    switch (type) {
      case "edit":
        if (hasShow) {
          buttons.push(
            <ShowButton basePath={basePath} record={data} key={++counter} />
          );
        }
        if (listButtonOverride) {
          //custom list button
          buttons.push(
            make_custom_button_element({
              ...listButtonOverride,
              key: ++counter
            })
          );
        } else {
          buttons.push(<ListButton basePath={basePath} key={++counter} />);
        }
        if (hasDelete && deleteButtonOverride && !read_only) {
          //custom delete button
          buttons.push(
            make_custom_button_element({
              ...deleteButtonOverride,
              key: ++counter
            })
          );
        } else if (hasDelete && !read_only) {
          buttons.push(
            <DeleteButton basePath={basePath} record={data} key={++counter} />
          );
        }
        buttons.push(<RefreshButton refresh={refresh} key={++counter} />);
        break;
      case "list":
        if (filters) {
          let cloned_filters = React.cloneElement(filters, {
            resource,
            showFilter,
            displayedFilters,
            filterValues,
            context: "button",
            key: ++counter
          });
          buttons.push(cloned_filters);
        }
        if (hasCreate && createButtonOverride && !read_only) {
          // custom create button
          buttons.push(
            make_custom_button_element({
              ...createButtonOverride,
              key: ++counter
            })
          );
        } else if (hasCreate && !read_only) {
          buttons.push(<CreateButton basePath={basePath} key={++counter} />);
        }
        buttons.push(<RefreshButton refresh={refresh} key={++counter} />);
        break;
      case "create":
        if (listButtonOverride) {
          // custom list button
          buttons.push(
            make_custom_button_element({
              ...listButtonOverride,
              key: ++counter
            })
          );
        } else {
          buttons.push(<ListButton basePath={basePath} key={++counter} />);
        }
        break;
      default:
      // nothing
    }

    return buttons;
  }
  render() {
    let buttons = this.state.buttons;
    if (buttons) {
      return <CardActions style={cardActionStyle}>{buttons}</CardActions>;
    } else {
      return null;
    }
  }
}
ActionPanel.propTypes = {
  customButtons: PropTypes.array
};
ActionPanel.defaultProps = {
  view: "list",
  listButtonOverride: false,
  createButtonOverride: false,
  deleteButtonOverride: false,
  customButtons: []
};
export default /**
 * @name ActionPanel
 * @description It is the panel in the List/Create/Edit (AOR) views.
 * It helps adding more controls to the view with no extra hassle.
 * Also can over-ride the natural(AOR) behaviour of the list/create/delete buttons.
 * @example <ActionPanel/>
 */
ActionPanel;
