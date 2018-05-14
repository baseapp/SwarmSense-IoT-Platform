/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import PropTypes from "prop-types";
import { DeleteMulti } from "./index";
import { resolveIfCompany } from "../utils";
import InjectParams from "./InjectParams";
import Forwarder from "./Forwarder";

/**
 * Make a multi-selectable dropdown for removing users from the company.
 */

class CompaniesUsersDelete extends React.Component {
  render() {
    return (
      <DeleteMulti
        label="users"
        source="user_emails"
        reference={`companies/${this.props.global_company.id}/users`}
        optionText="name"
        optionValue="email"
        title="Remove users from company"
        deleteUrl={`companies/${this.props.global_company.id}/users`}
        onCancel={() => this.context.router.history.goBack()}
      />
    );
  }
}
CompaniesUsersDelete.contextTypes = {
  router: PropTypes.object
};

export default props => (
  <InjectParams
    resolve={resolveIfCompany}
    OnFailResolve={<Forwarder to="/" message="Company not found!" />}
  >
    <CompaniesUsersDelete {...props} />
  </InjectParams>
);
