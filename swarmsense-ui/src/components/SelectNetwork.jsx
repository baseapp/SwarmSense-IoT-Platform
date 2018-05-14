/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import { connect } from "react-redux";
import LinearProgress from "material-ui/LinearProgress";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";
import { showNotification } from "admin-on-rest";
import { rest_client as restClient } from "../rest";

class NetworkSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      networks: [],
      selected: undefined,
      loading: true,
      message: "",
      sn_on: false
    };
  }
  componentDidMount() {
    restClient("GET_LIST", `companies/${this.props.company.id}/networks`, {
      pagination: { page: 1, perPage: 1000 },
      sort: { field: "id", order: "DESC" }
    })
      .then(json => {
        this.setState({ ...this.state, networks: json.data, loading: false });
      })
      .catch(err => {
        this.props.dispatch(showNotification(err.message, "warning"));
      });
  }
  render() {
    if (this.state.loading || !this.props.company.hasOwnProperty("id")) {
      return <LinearProgress />;
    } else {
      return (
        <SelectField
          onChange={(e, i, v) => {
            this.setState({ ...this.state, selected: v });
            this.props.assign_network(v);
          }}
          value={this.state.selected}
          floatingLabelText="Assign Network"
        >
          {this.state.networks.length > 0 &&
            this.state.networks.map((ob, k) => {
              return <MenuItem primaryText={ob.name} value={ob.id} key={k} />;
            })}
        </SelectField>
      );
    }
  }
}
//?injectCompany doesn't work
NetworkSelect = connect(state => ({
  company: state.postLoginInitials.global_company
}))(NetworkSelect);
export default /**
 * @name NetworkSelect
 * @example <NetworkSelect/>
 * @description A react ui component for creating a selectable menu of networks.
 */
NetworkSelect;
