/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import PropTypes from "prop-types";
import { List, ListItem } from "material-ui/List";
import IconButton from "material-ui/IconButton";
import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert";
import IconMenu from "material-ui/IconMenu";
import MenuItem from "material-ui/MenuItem";
const tertiaryStyle = { float: "right", opacity: 0.541176 };

const SimpleList = ({
  ids,
  data,
  basePath,
  primaryText,
  secondaryText,
  secondaryTextLines,
  tertiaryText,
  leftAvatar,
  leftIcon,
  rightAvatar,
  menuItems,
  editItems,
  leftCheckbox,
  onEditItem
}) => {
  return (
    <List>
      {ids.map(id => {
        let rightIcon = (editItems || menuItems) && (
          <IconMenu
            anchorOrigin={{ horizontal: "right", vertical: "top" }}
            targetOrigin={{ horizontal: "right", vertical: "top" }}
            iconButtonElement={
              <IconButton>
                <MoreVertIcon />
              </IconButton>
            }
          >
            {editItems && (
              <MenuItem
                key="first-me"
                primaryText="Edit"
                href={`#${basePath}/${id}`}
                onClick={() => onEditItem(data[id])}
              />
            )}
            {menuItems && menuItems(data[id], id)}
          </IconMenu>
        );
        return (
          <ListItem
            key={id}
            primaryText={
              <div>
                {primaryText(data[id], id)}
                {tertiaryText && (
                  <span style={tertiaryStyle}>
                    {tertiaryText(data[id], id)}
                  </span>
                )}
              </div>
            }
            secondaryText={secondaryText && secondaryText(data[id], id)}
            secondaryTextLines={secondaryTextLines}
            leftAvatar={leftAvatar && leftAvatar(data[id], id)}
            leftIcon={leftIcon && leftIcon(data[id], id)}
            leftCheckbox={leftCheckbox && leftCheckbox(data[id], id)}
            rightAvatar={rightAvatar && rightAvatar(data[id], id)}
            rightIconButton={rightIcon}
          />
        );
      })}
    </List>
  );
};
SimpleList.propTypes = {
  ids: PropTypes.array,
  data: PropTypes.object,
  basePath: PropTypes.string,
  primaryText: PropTypes.func,
  secondaryText: PropTypes.func,
  secondaryTextLines: PropTypes.number,
  tertiaryText: PropTypes.func,
  leftAvatar: PropTypes.func,
  leftIcon: PropTypes.func,
  rightAvatar: PropTypes.func,
  // rightIcon: PropTypes.func,
  menuItems: PropTypes.func, // Returning MenuItems React elements(array)
  editItems: PropTypes.bool,
  leftCheckbox: PropTypes.func
};
SimpleList.defaultProps = {
  editItems: true,
  secondaryTextLines: 2,
  onEditItem: f => f
};

export default SimpleList;
