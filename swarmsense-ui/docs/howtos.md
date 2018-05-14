# Howtos

General howtos for developer, by me, Hariom Soni <mailto:dcotre.1760@outlook.com>.
Following are some general scenarios, while developing/extending the moncon-web-ui -

## How to change menu for a user?

1. Locate the [Menu][1] component in the source tree. This file exports the react component which is rendered to create the menu in the sidebar. Most menu-items are rendered by the component [`MenuItem`][2] component.
2. Locate the `MenuItem` you want to change. You may do so, by looking for the value of `primaryText` prop of various MenuItem components, which makes the title, which user sees in the sidebar.
3. You may change the title for the user by changing `primaryText` prop. You may change `href` prop to the route, the user will be taken to, when the user clicks on this menu-item. You may also change the icon visible left to the title, by changing `leftIcon` prop to proper [`Icon`][3]. Visit [MenuItem][2] for more options.
4. You may add an item by making another `MenuItem` element similar to the other menu-items in the file, and add it according to suitable section ( the variable `admin_section` in the code has the menu-items for admin-users only. )
5. You may also include suitable component other than `MenuItem`, like I did by including ":: Change log history ::" section in the sidebar.

Notes

* For relation of [Menu][1] and admin-on-rest, see the `menu` prop of [`Admin`][4] component.

## How to add a new page aka a new route in our context ?

1. Locate the `customRoutes` variable in [custom_routes][5] file in source tree, which is an array. This array has [`Route`][6] elements in it. The [`Route`][6] element has two relevant props - `component` and `path`.
2. Import the component, into the `custom_routes` file that you want to render.
3. Make a [`Route`][6] element similar to the already included routes. Provide the component you just imported to the `component` prop and pass the route (ex. /cdash, /cdash/:dashboard_id, etc.) at which you want this component to be rendered to the `path` prop. For more example visit [here][6].
4. Include recently made route in `customRoutes` array before exporting.
5. Test it by, deploying the project locally and pointing your browser to something like - `http://localhost:3000/#/cdash`, etc.

Notes

* You may want to provide user a menu-item to go to this route. One way of doing so, can be, using the sidebar (for which you may look "change menu" section above).
* For relation of `customRoutes` and admin-on-rest, see the [`customRoutes`][7] prop of [`Admin`][4].

## How to add a new resource to the app ?

### [Resource][8]

It is provided by the admin-on-rest, which is used in making children of the [Admin][4] component. In simple words,
it corresponds to a logical resource in the backend such as "companies/{company_id}/sensors", "users", "companies/{company_id}/sensors", which has CURD or Create, Update, Read and Delete, facilities.

NOTE:
Admin-on-rest does not facilitates nested resources for ex. "/posts/{post_id}/comments", "user/{user_id}/posts", etc., which presented me with a challenge to connect backend REST API, since it has nested resources such as "/companies/{company_id}/sensors", "/sensors/{sensor_id}/alerts", "/companies/{company_id}/alert_history", etc.
For more info see the architecture section.

### Steps to add a resource ( illustration )

Follow below mentioned steps to add a resource to the app. For the purpose of example, I'd illustrate it using the api point "/companies/{company_id}/sensors", which is a nested resource

1. Prepare the connector( the layer for connecting to the api ).
   1. First, locate [`url_transforms.js`][9] file, where all the resources are listed in variable `url_transforms`, which is a JS object.
   2. Think a proper name for the resource such as "company_sensors", since it is a nested resource, i.e. companies -> sensors. I have used "company_sensors" name. Otherwise, you may use the same name as the api endpoint.
   3. Use this name as a key in the `url_transforms`, object, at the top level. This shall be the route where the browser would point to for requesting from the api, in the client's address bar, like, "http://localhost:3000/#/company_sensors".
   4. The value of the key, "company_sensors", would be an object with two keys - `url`(String) and `parameters`(Array). The `url` key will have a string value pointing to the api point along with a placeholder,
      for the parameter. Here, in the api point, "/companies/{company_id}/sensors", "{company_id}" is a parameter. Internally, I have represented parameters as "cid" for "{company_id}". Therefore the `url` value is `companies/cid/sensors`. The `parameter` key is an array declaring, the placeholders and in turn parameters for the `url`. Since there is only one parameter here, the value of the `parameter` will be `["cid"]`.
   5. If an api end point's request and response are mostly in sync with the [tables (see Request Format & Response Format)][11], you don't have to worry about, but if the api point needs some specific changes such as to upload file, etc. you may require to tweak the `rest_client` function in the [`rest_client.js`][10] file, aptly. In case of current example, I don't have to do any thing to tweak the function. You can see [this][12] as an example of tweak to enable file-upload.
2. Prepare the component for handling reading list of data from the resource.
   1. Locate _frontend/src/components_ directory, in the source-tree, where all the react-components are placed.
   2. Make a file with proper name for the component. I have named it as [`ListSensors.jsx`][13].
   * Import relevant components for listing the records in the data (basically making the grid), received by this component.
   * I have used the admin-on-rest's [List][14] component, which receives the data internally from the connector layer( comprised of `rest_client` function ).
   * Then passes the data down to the functional component.
   * This functional component is rendered with a `permission` prop, which is result of [authorization][15] scheme of admin-on-rest and `auth_client` function called with argument type equals to `AUTH_GET_PERMISSIONS` defined in [`auth_client.js`][16] file.
   * According to permission, the [`Responsive`][17] component is rendered, which in turn renders [`SimpleList`][18] or [`DataGrid`][19] on the basis of current window width of the client.
   * I have used various [Field][20] components in the [`DataGrid`][19] for making each column.
   * A very good explanation is provided in [here][14], for all the available options.
   * Make the component for the route, export it. I have exported the `SensorsList` from the [`ListSensors.jsx`][13]. And then, export it using the [`index.js`][21]. I have exported `SensorsList`(global) as `ListSensors`(non-global) from the same.
3. Prepare the component for editing the resource's one record. Particularly for the route - `companies/{company_id}/sensors/{sensor_id}`, aka `company_sensors/{sensor_id}` internally, which supports GET and PUT request-verbs.
   1. Again, make a file with a proper name in the _frontend/src/components_ directory, for the component to handle this route of the resource. I have made [`EditSensor.jsx`][22] file for it.
   2. Write the component to handle it.
   * I have used [`Edit`][23] component from the admin-on-rest.
   * I have used [`SimpleForm`][24] component as a child to the [`Edit`][23] component, to lay out form and the fields.
   * I have used various [input][25] components as a children to [`SimpleForm`][24] component, for various input fields in the form.
   * Then I have exported it as global and then exported it as non-global from [`index.js`][21]
4. Prepare the component for creating the resource's one record. Particularly for the route - `companies_sensors` with POST request-verb.
   1. Again, make a file, similar to above. I have made [`CreateSensor.jsx`][26]
   2. Write the component to handle making of a company's sensor.
   * Apart from the [`Create`][23] component, which renders "creating view", everything else usually remains same as the `EditSensor` component in [`EditSensor.jsx`][22]
   * Then I exported it globally from the [`CreateSensor.jsx`][26] and non-globally from [`index.js`][21].
5. Use these prepared component for defining the resource in the main [`Admin`][4] containing component. This file is [`MonconAdminApp.jsx`][27]
   * First, import all the components (CRUD) from the components. I have imported `ListSensors` as `SensorsList`, `EditSensor` as `SensorsEdit` and `CreateSensor` as `SensorsCreate` and `Delete` (component from admin-on-rest), which is ready to use component for deleting resource.
   * Then add [Resource][8] component as child of [`Admin`][4] component. I have done it using -
     * `<Resource name="company_sensors" list={SensorsList} edit={SensorsEdit} create={SensorsCreate} remove={Delete} />`
6. Now, save your work and verify your work, by pointing to "http://localhost:3000/#/{resource_name}". For this illustration, the url would be "http://localhost:3000/#/company_sensors".

[1]: https://bitbucket.org/ba_mon/moncon/src/master/webware/frontend/src/components/Menu.jsx
[2]: http://www.material-ui.com/#/components/menu
[3]: http://www.material-ui.com/#/components/svg-icon
[4]: https://marmelab.com/admin-on-rest/Admin.html
[5]: https://bitbucket.org/ba_mon/moncon/src/master/webware/frontend/src/routes/custom_routes.js
[6]: https://reacttraining.com/react-router/core/api/Route
[7]: https://marmelab.com/admin-on-rest/Admin.html#customroutes
[8]: https://marmelab.com/admin-on-rest/Resource.html
[9]: https://bitbucket.org/ba_mon/moncon/src/master/webware/frontend/src/rest/url_transforms.js
[10]: https://bitbucket.org/ba_mon/moncon/src/master/webware/frontend/src/rest/rest_client.js
[11]: https://marmelab.com/admin-on-rest/RestClients.html#writing-your-own-rest-client
[12]: https://marmelab.com/admin-on-rest/RestClients.html#decorating-your-rest-client-example-of-file-upload
[13]: https://bitbucket.org/ba_mon/moncon/src/master/webware/frontend/src/components/ListSensors.jsx
[14]: https://marmelab.com/admin-on-rest/List.html
[15]: https://marmelab.com/admin-on-rest/Authorization.html
[16]: https://bitbucket.org/ba_mon/moncon/src/master/webware/frontend/src/rest/auth_client.js
[17]: https://marmelab.com/admin-on-rest/Theming.html#responsive-utility
[18]: https://marmelab.com/admin-on-rest/List.html#the-simplelist-component
[19]: https://marmelab.com/admin-on-rest/List.html#the-datagrid-component
[20]: https://marmelab.com/admin-on-rest/Fields.html
[21]: https://bitbucket.org/ba_mon/moncon/src/master/webware/frontend/src/components/index.js
[22]: https://bitbucket.org/ba_mon/moncon/src/master/webware/frontend/src/components/EditSensor.jsx
[23]: https://marmelab.com/admin-on-rest/CreateEdit.html#the-create-and-edit-components
[24]: https://marmelab.com/admin-on-rest/CreateEdit.html#the-simpleform-component
[25]: https://marmelab.com/admin-on-rest/Inputs.html
[26]: https://bitbucket.org/ba_mon/moncon/src/master/webware/frontend/src/components/CreateSensor.jsx
[27]: https://bitbucket.org/ba_mon/moncon/src/master/webware/frontend/src/MonconAdminApp.jsx
