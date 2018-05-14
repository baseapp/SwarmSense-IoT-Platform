/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React, { Component } from "react";
import { connect } from "react-redux";
import { changeLocale as changeLocaleAction } from "admin-on-rest";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";
import PropTypes from "prop-types";
class LocaleSwitcher extends Component {
  handleChange = (e, i, v) => {
    //console.log(e,i,v)
    switch (v) {
      case "en":
        this.switchToEnglish();
        break;
      case "fr":
        this.switchToFrench();
        break;
      case "cn":
        this.switchToChinese();
        break;
      case "de":
        this.switchToGerman();
        break;
      case "hu":
        this.switchToHungarian();
        break;
      case "it":
        this.switchToItalian();
        break;
      case "pt":
        this.switchToPortugues();
        break;
      case "ru":
        this.switchToRussian();
        break;
      case "vi":
        this.switchToVietnamese();
        break;
      default:
        this.switchToEnglish();
    }
    this.context.router.history.replace("/");
  };
  switchToFrench = () => {
    this.props.dispatch(this.props.changeLocale("fr"));
  };
  switchToEnglish = () => {
    this.props.dispatch(this.props.changeLocale("en"));
  };
  switchToChinese = () => {
    this.props.dispatch(this.props.changeLocale("cn"));
  };
  switchToGerman = () => {
    this.props.dispatch(this.props.changeLocale("de"));
  };

  switchToHungarian = () => {
    this.props.dispatch(this.props.changeLocale("hu"));
  };
  switchToItalian = () => {
    this.props.dispatch(this.props.changeLocale("it"));
  };
  switchToPortugues = () => {
    this.props.dispatch(this.props.changeLocale("pt"));
  };
  switchToRussian = () => {
    this.props.dispatch(this.props.changeLocale("ru"));
  };
  switchToSpanish = () => {
    this.props.dispatch(this.props.changeLocale("es"));
  };
  switchToVietnamese = () => {
    this.props.dispatch(this.props.changeLocale("vi"));
  };
  render() {
    //console.log(this.props.store)
    return (
      <div style={{ padding: "10px" }}>
        <SelectField
          value={this.props.store.locale}
          onChange={this.handleChange}
          floatingLabelText="Language"
        >
          <MenuItem value="en" primaryText="English" />
          <MenuItem value="fr" primaryText="French" />
          <MenuItem value="cn" primaryText="Chinese" />
          <MenuItem value="de" primaryText="German" />

          <MenuItem value="hu" primaryText="Hungarian" />
          <MenuItem value="it" primaryText="Italian" />
          <MenuItem value="pt" primaryText="Portugues" />
          <MenuItem value="ru" primaryText="Russian" />
          <MenuItem value="es" primaryText="Spanish" />
          <MenuItem value="vi" primaryText="Vietnamese" />
        </SelectField>
      </div>
    );
  }
}
const propsToState = (state, props) => {
  return {
    store: state,
    changeLocale: changeLocaleAction
  };
};
LocaleSwitcher.contextTypes = {
  router: PropTypes.object
};
export default /**
 * @name LocaleSwitcher
 * @example <LocaleSwitcher/>
 * @description A dropdown menu to change the language of ui.
 */
connect(propsToState)(LocaleSwitcher);
