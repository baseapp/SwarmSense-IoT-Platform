/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import { connect } from "react-redux";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";
import LinearProgress from "material-ui/LinearProgress";
import FlatButton from "material-ui/FlatButton";
import PropTypes from "prop-types";
import { showNotification } from "admin-on-rest";
import { select_company, set_meta_data } from "../actions";
import { rest_client as restClient } from "../rest";
import { set_params } from "../utils";

class CompanySwitcher extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      data: [],
      selected_index: 0,
      last_login_uid: ""
    };
  }
  make_component() {
    let token = sessionStorage.getItem("token");
    if (!token) {
      return; // don't do anything if no token is set
    }
    restClient("GET_LIST", "companies", {
      pagination: { perPage: 500, page: 1 },
      sort: { field: "id", order: "DESC" },
      filter: {}
    }).then(json => {
      this.setState({ ...this.state, data: json.data, isLoading: false });
    });
  }
  componentDidMount() {
    this.make_component();
  }
  get_selected_company() {
    return this.props.postLoginInitials.global_company.name;
  }
  set_selected_company(value) {
    value = this.state.data.filter(ob => (ob.name === value ? true : false))[0];
    //console.log(value)
    let logged_in_as = sessionStorage.getItem("logged_in_as"),
      post_login_initials = {};
    if (logged_in_as === "0") {
      post_login_initials = localStorage.getItem("post_login_initials");
    } else {
      post_login_initials = sessionStorage.getItem("post_login_initials");
    }
    if (!post_login_initials) {
      post_login_initials = this.props.postLoginInitials;
    } else {
      post_login_initials = JSON.parse(post_login_initials);
    }
    sessionStorage.setItem("company_role", value.role);
    post_login_initials.global_company = value;
    if (logged_in_as === "0") {
      localStorage.setItem(
        "post_login_initials",
        JSON.stringify(post_login_initials)
      );
    } else {
      sessionStorage.setItem(
        "post_login_initials",
        JSON.stringify(post_login_initials)
      );
    }
    set_params("global_company", post_login_initials.global_company);
    this.props.dispatch(this.props.changeCompany(value));
  }
  make_default() {
    this.setState({ ...this.state, isLoading: true }, () => {
      let selected_company_id = this.props.postLoginInitials.global_company.id;
      restClient("CREATE", "me/meta_data", {
        data: { key: "default_company_id", value: selected_company_id }
      })
        .then(() => {
          let logged_in_as = sessionStorage.getItem("logged_in_as"),
            post_login_initials = {};
          if (logged_in_as === "0") {
            post_login_initials = localStorage.getItem("post_login_initials");
          } else {
            post_login_initials = sessionStorage.getItem("post_login_initials");
          }
          if (!post_login_initials) {
            post_login_initials = this.props.postLoginInitials;
          } else {
            post_login_initials = JSON.parse(post_login_initials);
          }
          post_login_initials.meta_data.default_company_id = selected_company_id;
          if (logged_in_as === "0") {
            localStorage.setItem(
              "post_login_initials",
              JSON.stringify(post_login_initials)
            );
          } else {
            sessionStorage.setItem(
              "post_login_initials",
              JSON.stringify(post_login_initials)
            );
          }
          this.props.dispatch(set_meta_data(post_login_initials.meta_data));
          this.setState({ ...this.state, isLoading: false });
        })
        .catch(err => {
          this.props.dispatch(showNotification(err.message, "warning"));
          this.setState({ ...this.state, isLoading: false });
        });
    });
  }
  render() {
    if (this.state.isLoading) {
      return <LinearProgress />;
    } else {
      let {
          postLoginInitials: {
            global_company: { id },
            meta_data: { default_company_id = "" }
          }
        } = this.props,
        disable_default_button =
          id && default_company_id && id === default_company_id ? true : false;
      return (
        <div style={{ padding: "10px" }}>
          <SelectField
            onChange={(eve, index, value) => {
              this.set_selected_company(value);
            }}
            value={this.get_selected_company()}
            name="company"
            floatingLabelText="Company"
          >
            {this.state.data.map((ob, i) => {
              return <MenuItem key={i} value={ob.name} primaryText={ob.name} />;
            })}
          </SelectField>
          <br />
          <FlatButton
            secondary
            label="Make it default!"
            onClick={() => this.make_default()}
            disabled={disable_default_button}
          />
        </div>
      );
    }
  }
}

let mapStateToProps = state => {
  return {
    postLoginInitials: state.postLoginInitials,
    changeCompany: select_company
  };
};
CompanySwitcher.contextTypes = {
  router: PropTypes.object
};
CompanySwitcher = connect(mapStateToProps)(CompanySwitcher);
export default /**
 * @name CompanySwitcher
 * @example <CompanySwitcher/>
 * @description A react component(drowdown menu) to change the current company
 */
CompanySwitcher;
