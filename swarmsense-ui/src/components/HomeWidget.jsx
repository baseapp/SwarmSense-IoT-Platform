/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import { Card, CardTitle, CardText } from "material-ui/Card";
import CircularProgress from "material-ui/CircularProgress";
import PropTypes from "prop-types";

/**
 * Widget - Makes a widget. Used in user dashboard.
 *
 * @param  {Object} props
 * @return {React.Node}
 */

function Widget(props) {
  const {
    id,
    cardStyle,
    title,
    moreLink,
    onMorePress,
    content_id,
    content
  } = props;
  return (
    <div style={{ gridArea: id || undefined }}>
      <Card style={cardStyle}>
        <CardTitle>
          {title}
          {moreLink && (
            <a
              href={moreLink}
              className="simple-link"
              style={{ float: "right" }}
              onClick={() => onMorePress()}
            >
              More ...
            </a>
          )}
        </CardTitle>
        <CardText>
          <div id={content_id || undefined}>{content}</div>
        </CardText>
      </Card>
    </div>
  );
}
Widget.defaultProps = {
  content: "",
  title: "",
  onMorePress: () => {}
};
Widget.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  make_content: PropTypes.func,
  onMorePress: PropTypes.func
};
export default Widget;
