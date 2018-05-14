/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */

import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import shouldUpdate from "recompose/shouldUpdate";
import compose from "recompose/compose";
import FlatButton from "material-ui/FlatButton";
import ContentCreate from "material-ui/svg-icons/content/create";
import linkToRecord from "admin-on-rest/lib/util/linkToRecord";
import translate from "admin-on-rest/lib/i18n/translate";

/**
 * A custom EditButton with feature to do something when clicked on it
 * along with moving to the "editing" route of the resource.
 * @function EditButton
 */

const EditButton = ({
  basePath = "",
  label = "aor.action.edit",
  record = {},
  translate,
  onClick
}) => (
  <FlatButton
    primary
    label={label && translate(label)}
    icon={<ContentCreate />}
    containerElement={<Link to={linkToRecord(basePath, record.id)} />}
    style={{ overflow: "inherit" }}
    onClick={() => onClick(record)}
  />
);

EditButton.propTypes = {
  basePath: PropTypes.string,
  label: PropTypes.string,
  record: PropTypes.object,
  translate: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired
};
EditButton.defaultProps = {
  onClick: f => f
};
const enhance = compose(
  shouldUpdate(
    (props, nextProps) =>
      (props.record &&
        nextProps.record &&
        props.record.id !== nextProps.record.id) ||
      props.basePath !== nextProps.basePath ||
      (props.record == null && nextProps.record != null)
  ),
  translate
);

export default enhance(EditButton);
