/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";
import { Card, CardText, CardActions } from "material-ui/Card";
import LinearProgress from "material-ui/LinearProgress";
import PropTypes from "prop-types";
import RaisedButton from "material-ui/RaisedButton";
import { Notification, showNotification, ViewTitle } from "admin-on-rest";
import { connect } from "react-redux";
import { rest_client as restClient } from "../rest";
class DeleteMulti extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true, data: [], selected: [] };
  }
  /***
   * processes the delete request.
   */
  delete() {
    let data = {};
    data[this.props.source] = this.state.selected;
    restClient("DELETE_MANY", this.props.deleteUrl, { data: data })
      .then(json => {
        this.props.dispatch(showNotification("Deleted!"));
        this.context.router.history.goBack();
      })
      .catch(err => {
        this.props.dispatch(showNotification(err.message, "warning"));
      });
  }

  componentDidMount() {
    restClient("GET_LIST", this.props.reference, {
      pagination: { page: 1, perPage: 1000 },
      sort: { order: "DESC", field: "id" }
    })
      .then(json => {
        this.setState({ ...this.state, loading: false, data: json.data });
      })
      .catch(err => {
        this.props.dispatch(showNotification(err.message, "warning"));
        this.setState({ ...this.state, loading: false });
      });
  }
  /***
   * makes items for the drop down menu
   * @returns {MenuItem[]|MenuItem} MenuItem is a material-ui component.
   */
  make_menu_items() {
    if (this.state.data.length > 0) {
      return this.state.data.map((ob, i) => {
        return (
          <MenuItem
            key={i}
            value={ob[this.props.optionValue]}
            primaryText={ob[this.props.optionText]}
          />
        );
      });
    } else {
      return <MenuItem value={null} primaryText="" />;
    }
  }
  /***
   * creates the content to present to user
   */
  make_content() {
    if (this.state.loading) {
      return <LinearProgress />;
    } else if (this.state.data.length === 0) {
      // no data
      return (
        <Card>
          <CardText>
            Nothing to remove!{" "}
            <RaisedButton
              label="Go back"
              onClick={() => {
                this.props.onCancel
                  ? this.props.onCancel()
                  : this.context.router.history.goBack();
              }}
              primary
            />
          </CardText>
        </Card>
      );
    } else {
      return (
        <Card>
          <CardText>
            <SelectField
              onChange={(e, k, v) => {
                this.setState({ ...this.state, selected: v });
              }}
              multiple={true}
              floatingLabelText={this.props.label}
              value={this.state.selected}
            >
              {this.make_menu_items()}
            </SelectField>
          </CardText>
          <CardActions>
            <RaisedButton
              label="Delete"
              onClick={() => this.delete()}
              primary
            />
            <RaisedButton
              label="Cancel"
              onClick={() => {
                this.props.onCancel
                  ? this.props.onCancel()
                  : this.context.router.history.goBack();
              }}
              primary
            />
          </CardActions>
          <Notification />
        </Card>
      );
    }
  }
  render() {
    return (
      <Card>
        <ViewTitle title={this.props.title} />
        {this.make_content()}
      </Card>
    );
  }
}

DeleteMulti.propTypes = {
  label: PropTypes.string.isRequired,
  reference: PropTypes.string.isRequired,
  source: PropTypes.string.isRequired,
  optionText: PropTypes.string.isRequired,
  optionValue: PropTypes.string.isRequired,
  deleteUrl: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
};
DeleteMulti.contextTypes = {
  router: PropTypes.object
};
DeleteMulti = connect()(DeleteMulti);
export default /**
 * @name DeleteMulti
 * @example <DeleteMulti/>
 * @description A react component to delete multiple records from the
 * endpoint. Creates multiple item selectable dropdown menu.
 */
DeleteMulti;
