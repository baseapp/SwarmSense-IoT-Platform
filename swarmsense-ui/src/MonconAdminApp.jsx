/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
 
import React from "react";
import { Resource, Admin } from "admin-on-rest";
import { Delete } from "admin-on-rest/lib/mui";
import PropTypes from "prop-types";
import { Route } from "react-router-dom";
import { rest_client as restClient, auth_client as authClient } from "./rest";
import { company_saga as companySaga } from "./sagas";
import { getPostLoginInitials, get_logger } from "./utils";
import { customRoutes } from "./routes";
import { post_login_initials_reducer as postLoginInitialsReducer } from "./reducers";
import {
  Menu,
  Forwarder,
  HomeDashboard as Dashboard,
  ListCompanyUsers as CompaniesUsersList,
  Layout,
  ListSensorTypes as SensorTypesList,
  CreateSensorType as SensorTypeCreate,
  EditSensorType as SensorTypeEdit,
  ListSensorHistory as SensorsHistoryList,
  ListUsers as UserList,
  CreateUser as UserCreate,
  EditUser as UserEdit,
  ListSensorAlerts as SensorsAlertsTypeList,
  DeleteCompanyUsers as CompaniesUsersDelete,
  CreateCompanyUser as CompaniesUserCreate,
  ListNetworkAlerts as NetworkAlertsList,
  ListCompanies as CompaniesList,
  CreateCompany as CompaniesCreate,
  EditCompany as CompaniesEdit,
  MapSensors as SensorsMap,
  ListSensors as SensorsList,
  EditSensor as SensorsEdit,
  CreateSensor as SensorsCreate,
  CreateNetworkAlert as NetworkAlertsCreate,
  EditNetworkAlert as NetworkAlertsEdit,
  ListAlertHistory as AlertHistory,
  MapNetworkSensors as NetworkSensorsMap,
  ListAlertTypes as AlertsTypeList,
  CreateAlertType as AlertsTypeCreate,
  EditAlertType as AlertsTypeEdit,
  ExportSensorHistory as HistoryExport,
  ListNetworks as NetworksList,
  CreateNetwork as NetworkCreate,
  EditNetwork as NetworkEdit,
  ListNetworkSensors as NetworkSensorsList,
  EditSensorConfiguration as SensorConfigurationEdit,
  ListSettings as SettingsList,
  CreateSetting as SettingsCreate,
  EditSetting as SettingsEdit,
  CreateMetadata as MetadataCreate,
  ListMetadata as MetadataList,
  MapSensorsByType as SensorsByTypeMap,
  CreateMe as MeCreate,
  ListMe as MeList,
  CreateNetworkSensors as NetworkSensorsCreate,
  DeleteNetworkSensors as NetworkSensorsDelete,
  CreateSensorAlert as SensorsAlertsCreate,
  ListSensorsByType as SensorsByTypeList,
  DeleteSensorAlert as SensorsAlertsDelete,
  PageLogin as LoginPage,
  ListCompanyEventLogs as EventsLog,
  ListCustomDashboards as MyDashboard,
  CreateCustomDashboard as CreateMyDashboard,
  EditCustomDashboard as EditMyDashboard,
  ListEvents,
  ListSensorEvents,
  CreateEvent,
  EditEvent,
  CreateSensorEvents,
  DeleteSensorEvents,
  ListEventsHistory,
  UserProfile as Profile
} from "./components";

import { englishMessages } from "admin-on-rest";
import * as domainMessages from "admin-on-rest/lib/i18n";
import frenchMessages from "aor-language-french";
import chineseMessages from "aor-language-chinese";
import germanMessages from "aor-language-german";
import hungarianMessages from "aor-language-hungarian";
import italianMessages from "aor-language-italian";
import portuguesMessages from "aor-language-portugues";
import russianMessages from "aor-language-russian";
import spanishMessages from "aor-language-spanish";
import vietnameseMessages from "aor-language-vietnamese";

const messages = {
  en: { ...englishMessages, ...domainMessages.en },
  fr: { ...frenchMessages, ...domainMessages.fr },
  cn: { ...chineseMessages, ...domainMessages.cn },
  de: { ...germanMessages, ...domainMessages.de },
  hu: { ...hungarianMessages, ...domainMessages.hu },
  it: { ...italianMessages, ...domainMessages.it },
  pt: { ...portuguesMessages, ...domainMessages.pt },
  ru: { ...russianMessages, ...domainMessages.ru },
  sp: { ...spanishMessages, ...domainMessages.sp },
  vi: { ...vietnameseMessages, ...domainMessages.vi }
};

/**
 * MonconAdminApp - Admin-on-rest's Admin Component of the application. This functional component is
 * responsible for loading the main application which is built using the framework of AOR.
 * It accepts an object as a parameter, whose postLoginInitials property defines initialization for global-company
 * and user meta-data.
 */

function MonconAdminApp({ postLoginInitials }) {
  return (
    <Admin
      dashboard={Dashboard}
      restClient={restClient}
      title={window.application.settings.site_title || "Portal"}
      authClient={authClient}
      locale="en"
      customRoutes={customRoutes}
      loginPage={LoginPage}
      messages={messages}
      appLayout={Layout}
      customReducers={{
        postLoginInitials: postLoginInitialsReducer
      }}
      initialState={{
        postLoginInitials
      }}
      customSagas={[companySaga]}
      menu={Menu}
    >
      {permissions => {
        let admin_resources = [];
        return [
          ...admin_resources,
          <Resource
            name="company_users"
            list={CompaniesUsersList}
            create={props => (
              <CompaniesUserCreate {...props} title="Assign users to company" />
            )}
            edit={CompaniesUsersDelete}
          />,
          <Resource
            name="settings"
            list={SettingsList}
            create={SettingsCreate}
            remove={Delete}
            edit={SettingsEdit}
          />,
          <Resource
            name="users"
            list={UserList}
            create={UserCreate}
            remove={Delete}
            edit={UserEdit}
          />,
          <Resource
            name="sensor_types"
            list={SensorTypesList}
            edit={SensorTypeEdit}
            create={SensorTypeCreate}
            remove={Delete}
          />,
          <Resource
            name="companies"
            list={CompaniesList}
            edit={CompaniesEdit}
            remove={Delete}
            create={CompaniesCreate}
          />,
          <Resource
            name="me"
            list={MeList}
            create={MeCreate}
            edit={props => <Forwarder to="/me" />}
          />,
          <Resource
            name="my_meta_data"
            list={MetadataList}
            create={MetadataCreate}
            edit={props => <Forwarder to="/my_meta_data" />}
          />,
          <Resource name="settings_all" />,
          <Resource name="sensor_types_all" />,
          <Resource name="sensor_data_types" />,
          <Resource
            name="company_sensors"
            list={SensorsList}
            edit={SensorsEdit}
            create={SensorsCreate}
            remove={Delete}
          />,
          <Resource name="company_sensors_by_type" list={SensorsByTypeList} />,
          <Resource
            name="sensor_alerts"
            list={props => (
              <SensorsAlertsTypeList
                title="Alerts-type(Sensor-wide)"
                sid={true}
                {...props}
              />
            )}
            create={SensorsAlertsCreate}
            edit={SensorsAlertsDelete /*Improvise!*/}
          />,
          <Resource
            name="company_alerts"
            list={AlertsTypeList}
            create={AlertsTypeCreate}
            edit={AlertsTypeEdit}
            remove={Delete}
          />,
          <Resource
            name="company_networks"
            list={NetworksList}
            edit={NetworkEdit}
            create={NetworkCreate}
            remove={Delete}
          />,
          <Resource
            name="company_network_sensors"
            list={NetworkSensorsList}
            create={NetworkSensorsCreate}
            edit={NetworkSensorsDelete}
          />,
          <Resource
            name="sensor_configuration"
            list={SensorConfigurationEdit}
          />,
          <Resource
            name="company_network_alerts"
            list={NetworkAlertsList}
            create={NetworkAlertsCreate}
            edit={NetworkAlertsEdit}
          />,
          <Resource name="alert_history" list={AlertHistory} />,
          <Resource name="sensor_export" list={HistoryExport} />,
          <Resource name="sensors_map" list={SensorsMap} />,
          <Resource name="network_sensors_map" list={NetworkSensorsMap} />,
          <Resource name="sensors_type_map" list={SensorsByTypeMap} />,
          <Resource name="sensor_values" />,
          <Resource name="sensor_history" list={SensorsHistoryList} />,
          <Resource name="events_log" list={EventsLog} />,
          <Resource
            name="my_dashboards"
            list={MyDashboard}
            edit={EditMyDashboard}
            create={CreateMyDashboard}
            remove={Delete}
          />,
          <Resource name="company_alert_history" />,
          <Resource name="login" />,
          <Resource name="signup" />,
          <Resource name="forgot-password" />,
          <Resource name="reset-password" />,
          <Resource
            name="events"
            list={ListEvents}
            create={CreateEvent}
            edit={EditEvent}
            remove={Delete}
          />,
          <Resource
            name="sensor_events"
            list={ListSensorEvents}
            create={CreateSensorEvents}
            edit={DeleteSensorEvents}
          />,
          <Resource name="events_history" list={ListEventsHistory} />
        ];
      }}
    </Admin>
  );
}
MonconAdminApp.propTypes = {
  postLoginInitials: PropTypes.object.isRequired
};
export default MonconAdminApp;
