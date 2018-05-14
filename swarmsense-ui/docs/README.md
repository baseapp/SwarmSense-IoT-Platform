# Moncon-web-frontend(MWF)

## Introduction

Moncon-web-frontend(MWF) is an [admin-on-rest(AOR)][1] based
single page web-application for the REST based web-service
[Moncon-backend-service(MBS)][2]. MWF provides
users a general CRUD interface to consume the MBS.

## Production usage

To use the production build,

1. Copy the code. You may do this in one of the following two ways -
   * Either copy the contents of the folder `moncon/webware/frontend/build/`.
   * Or Copy the archive from `moncon/webware/frontend/dist/moncon-web-frontend-x.x.x.tar.bz2` and extract the contents.
2. Now, the code is present in the directory( Let's assume we have given "`server-code`" name to the directory, where the code is extracted/copied. )
3. Change the directory to "`server-code`"(refer step-2).
4. Change value of the `API_URL` variable to the proper url-address of the moncon-backend api endpoint in the file `server-code/public/config.js`. For ex., the line would look like this - `var API_URL = 'http://45.79.8.213:5000'`.
5. Copy all of the contents of "`server-code`" directory to the remote-directory from where your site is hosted, to serve the application.

## Dependencies

The app is written mostly in [JS(ES6)][3] using the [React][4] library and [admin-on-rest][1] framework. Following is the list of direct-dependencies of the app(mentioned in [package.json][18]) -

* [admin-on-rest][1] - "A frontend Framework for building admin applications running in
  the browser on top of REST services, using ES6, React and Material Design. Open sourced and maintained by marmelab.",
  * Language packages for UI -
    * aor-language-chinese ,
    * aor-language-french ,
    * aor-language-german ,
    * aor-language-hungarian ,
    * aor-language-italian ,
    * aor-language-portugues ,
    * aor-language-russian ,
    * aor-language-spanish ,
    * aor-language-vietnamese ,
* [highcharts][9] - for drawing charts for history data,
* [moment][10] - for parsing dates in terms of moments,
* [prop-types][11] - "Runtime type checking for React props and similar objects.",
* [react-scripts][12] - "This package includes scripts and configuration used by Create React App",
* [documentation][13] - for generating [API.md][14] using the JSDoc comments in the source code,
* [redux-form-material-ui][15] - "A set of wrapper components to facilitate using Material UI with Redux Form",
* [leaflet][16] - for using geographical maps,
* [react-leaflet][17] - "React components for Leaflet maps"

Following are the python-packages used to generate the html documentation from the source (made of .rst and .md files) -

* [sphinx][32] - Python documentation generator.
* [sphinx_rtd_theme][33] - The sphinx_rtd_theme is a sphinx theme designed to look modern and be mobile-friendly.
* [recommonmark][34] - It is a Docutils bridge to CommonMark-py, a Python package for parsing the CommonMark Markdown flavor.

## System Requirements to build/develop

MWF consists of static files(HTML, CSS, JS & images) which are built for the purpose of production. These files can then be served by any HTTP server.

Ensure following for the system where the code will be built -

* Ubuntu OS.
* Python(>=3.5): For building sphinx documentation.
* Node(>=7.10.1) is installed or else you may refer here [here][5].
* Node package manager(>=4.2.0) is installed or else you may refer [here][5]. You may also find useful information [here][6].
* Optionally, if you want to serve the application using the `serve` program. Install "serve" using `npm install serve`.

## Instructions to build MWF App (production)-

To build the production version of MWF, following are the instruction. Use linux command prompt to run the instruction.

1. Clone the repository to your machine using `git clone https://<username>@bitbucket.org/ba_mon/moncon.git` using the terminal. Replace "<username>" with your username in bitbucket.
2. Change directory to _frontend_ @ `moncon/webware/fronend`.
3. Run `npm install` to install all the dependencies.
4. Open [moncon/webware/frontend/public/config.js][7]
5. Change the variable `API_URL` to the proper address(a domain-name/IP address).
   For example the MBS is running at `http://xyz.com` the change would look like this - `apiUrl = 'http://xyz.com'`
6. Go to the directory _frontend_ @ `moncon/webware/fronend` and run `npm run build`. After successfully running this command, a directory inside _frontend_ folder will appear named _build_.
7. You may serve the static files from any kind of HTTP server. Just copy the contents of the folder `build` to your server. Alternatively, you may run `serve build` to serve from inside _frontend_ folder itself, if the [serve][8] package is installed.

## Instructions to build documentations

### While building the app

While building the application from the source, as indicated above, if you want to build docs also, there is a provision in the [build script][35], to do so.

You can control the documentation building as indicated in the script using an enviroment variable configured in the [package.json][18], under the key address `config.build_docs`. If the value of this variable is `on`, the docs are also build along with the app, otherwise if the value is `off`, the docs are not built.

### Separately,

If you want to build documentation separately, while in _frontend_ directory, run the command `npm run docs` on the command prompt, for generating the docs.

## Developing MWF

To develop(modify the source code), follow these steps-

1. Ensure that the system-requirements are met in your local(development) system.
2. Then, clone the moncon repository onto your local system. You may use the git command line
   like - `git clone https://<your_username>@bitbucket.org/ba_mon/moncon.git`. Replace "<your_username>" with your own bitbucket username.
3. After that go to(command `cd`) _frontend_ directory inside the _webware_ directory. This is the place where all the MWF development should be done.
4. Run `npm install`, while inside _frontend_ folder, to install all the necessary dependencies.
5. Change source code as required.

## Deploying locally(for test purposes):

1. While inside _frontend_ directory, run `npm start`, to run development server and host the development application on your system. By default, after running the server, any further change in the source-code(MWF) will make the server to hot-reload.

2. When satisfied with the changes, production version of the code can be prepared as indicated above using `npm run build`. This will result in _build_ directory inside _frontend_ directory containing production code.

## Directory structure

The directory structure of frontend(`moncon/webware/frontend`) is as follows,

1. `docs/` - contains documentations.
   1. [`API.md`][14] - References to all the various react components and JS functions used in the code.
2. `public/` - contains the website template for our app and its configuration.
3. `src/` - contains the source-code for the application from which final bundle of javascript can be built using `npm run build` by webpack.
4. `components/` - Here all the [react-components][20], which are used in main application, are placed.

   1. `bread_crumbs/` - Makes the breadcrumbs in the application according to the current route and parameters.
   2. `custom_dashboard/` - Makes the user-dashboards.
   3. `dashboard/` - A container with toolbar, children and menu. It is used to make various kind of dashboard.
   4. `floormap/` - Makes the network floormap.
   5. `home_dashboard/` - Makes the home page for any user.
   6. `input_lat_lng/` - Makes a [custom-input][28] for recording user-clicked point's location on the map.
   7. `iterator_map/` - Makes a [custom-iterator][29] for showing all the positions provided on the map.
   8. `ActionPanel` - Makes a ActionPanel component for easy over-ridding of the default behaviour of the buttons in the menu. See [actions prop][30] of [`List`][31] component of admin-on-rest.

5. `actions/` - All custom actions([redux-actions][19]) are placed here. Visit ["Writing Actions"][27] for understanding in context to admin-on-rest.
6. `i18n/` - All the internationalization relevant scripts are planned to be placed here. Please visit [translating][21] section in admin-on-rest, for further understanding.
7. `reducers/` - All the custom [reducers][22] used in the application are kept in here.
8. `rest/` - All the functions/libraries directly involved in connecting the frontend to the api(backend) are kept in here.
9. `routes/` - All the [custom-routes][23], which are not inbuilt using the [`Resource`][24] component of admin-on-rest, are defined here. So, in case, if one wants a page in the app to be added, create a route and assign it to a react-component, like [here][25].
10. `sagas/` - All the custom side-effects specifically known as ["sagas"][26] are kept in here.
11. `utils/` - All the utility based libraries/functions used in other parts of the source-tree are kept in here.
12. `index.js` - Webpack uses it as the starting point for the application. It sets the environment and renders the main component on to the client.
13. `MonconAdminApp.js` - Exports the main component of the application which is directly based on the admin-on-rest framework.

[1]: https://github.com/marmelab/admin-on-rest "AOR github"
[2]: https://bitbucket.org/ba_mon/moncon/src/master/webware/backend/README.md "MBS"
[3]: https://en.wikipedia.org/wiki/ECMAScript#6th_Edition_-_ECMAScript_2015 "ES-6 wiki"
[4]: https://en.wikipedia.org/wiki/React_(JavaScript_library) "React wiki"
[5]: https://nodejs.org/en/ "Download NodeJS environment(npm included)"
[6]: https://www.npmjs.com/get-npm
[7]: https://bitbucket.org/ba_mon/moncon/src/master/webware/frontend/public/config.js
[8]: https://www.npmjs.com/package/serve "serve"
[9]: http://api.highcharts.com/highcharts "highcharts api"
[10]: https://momentjs.com/ "MomentJS"
[11]: https://www.npmjs.com/package/prop-types "prop-types"
[12]: https://www.npmjs.com/package/react-scripts "react-scripts"
[13]: https://github.com/documentationjs/documentation "documentationJS github"
[14]: https://bitbucket.org/ba_mon/moncon/src/master/webware/frontend/docs/API.md
[15]: https://github.com/erikras/redux-form-material-ui "redux-form-material-ui github"
[16]: http://leafletjs.com/reference-1.2.0.html "LeafletJS reference"
[17]: https://github.com/PaulLeCam/react-leaflet "React-leaflet github"
[18]: https://bitbucket.org/ba_mon/moncon/src/master/webware/frontend/package.json
[19]: https://redux.js.org/basics/actions
[20]: https://reactjs.org/docs/components-and-props.html
[21]: https://marmelab.com/admin-on-rest/Translation.html
[22]: https://redux.js.org/basics/reducers
[23]: https://marmelab.com/admin-on-rest/Admin.html#customroutes
[24]: https://marmelab.com/admin-on-rest/Resource.html
[25]: https://bitbucket.org/ba_mon/moncon/src/master/webware/frontend/src/routes/custom_routes.js
[27]: https://marmelab.com/admin-on-rest/Actions.html
[26]: https://marmelab.com/admin-on-rest/Actions.html#handling-side-effects-with-a-custom-saga
[28]: https://marmelab.com/admin-on-rest/Inputs.html#writing-your-own-input-component
[29]: https://marmelab.com/admin-on-rest/List.html#using-a-custom-iterator
[30]: https://marmelab.com/admin-on-rest/List.html#actions
[31]: https://marmelab.com/admin-on-rest/List.html
[32]: http://www.sphinx-doc.org/en/master/usage/installation.html
[33]: https://github.com/rtfd/sphinx_rtd_theme
[34]: http://www.sphinx-doc.org/en/master/usage/markdown.html
[35]: https://bitbucket.org/ba_mon/moncon/src/master/webware/frontend/scripts/build_script.sh
