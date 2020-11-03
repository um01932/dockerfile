# myWorkplace API

## Contents
* [Install](#install)
* [Usage](#usage)
* [Advanded Topics](#advanced-topics)
* [myWorkplace Integration](#myworkplace-integration)
* [Build](#build)
* [Changelog](#changelog)
* [Roadmap](#roadmap)


<a name="#install"></a>
## Install


The library is distributed as an npm package.

```
npm install @myworkplace/api --registry https://lpitonexus01.bmwgroup.net:8088/repository/mwp-npm-api/ 
```

In a production environment please consider of proxying the package on your project's private npm repo.

The library supports UMD, so it will work with most popular module loaders.
Here is an example of how to include the library in a module
```Javascript
import {Messaging} from "@myworkplace/api";

// use the libary
Messaging.getClient();
```

Typescript definition files are distributed with the npm package, as well as source maps.

### Installation without npm

You can find the latest packages for download in our registry: [Download latest version](https://ito-ci.bmwgroup.net/repository/mwp-npm-api/@myworkplace/api/-/api-0.3.1.tgz)

To import the library, you can simply add a `<script>` tag to your `<head>` element. Adjust the path according to your folder structure.
```html
<script src="package/@myworkplace/api/lib/workplace-api.js"></script>
```

### Promises Polyfill
> Adding a Promise polyfill is required for older browsers! See https://caniuse.com/#feat=promises

The library expects an ES6 compatible Promise constructor. On plattforms that no not yet implement ES6 Promises
(Internet Explorer), a polyfill is required, such as [es6-promise](https://github.com/jakearchibald/es6-promise).


<a name="#usage"></a>
## Usage

For the Messaging API there are 2 categories of applications: **Hosts** and **Clients**.
In case of the Workplace Environment, the Workplace is a Host and its Apps are Clients.
Typically, when integrating an app into the Workplace, a Client should be created.

### Creating a client
Before creating a client, be sure to configure the security options of the client, see [[IClientConfig]].
Use the factory function [[Messaging.getClient]] to create and get an instance of [[Client]].
```JavaScript
// Security configuration
Messaging.clientConfig = {
  origin: 'https://workplace-int.bmwgroup.net', // only allow host connections from this origin
  allowConnectFrom: [] // allow direct connections from all apps
}
Messaging.getClient().then((client) => {
   //use the client to call host api functions 
});
```
### Workplace API Functions
Use [[Client.callApi]] to call api functions of the host. It will return a promise which resolves to the api functions result.

For a complete list of workplace api functions check the myWorkplace confluence page:
https://atc.bmwgroup.net/confluence/display/MWP/Workplace+API+Functions

### Workplace API Events
Use [[Client.registerApi]] to register for events fired by the host.

For a complete list of workplace api function check the myWorkplace confluence page:
https://atc.bmwgroup.net/confluence/display/MWP/Workplace+API+Events

<a name="#advanced-topics"></a>
## Advanced Topics

### Check for workplace environment
The workplace is calling the app with an url parameter `env=workplace`. Use this parameter to check whether
the app is running in the workplace context. Be aware that this is not a replacement for a security check.

```JavaScript
if(Messaging.isWorkplaceEnv()) {
    // running in workplace
};
```

### Connecting to other clients
To connect to a client B, a client A can call an api function on the host, called `connect`. Please refer to [[Client.callApi]].

Client A:
```JavaScript
client.callApi('connect', {id: 'clientB'}).then(function(connection) {
    //connection to client B has been established
    connection.callApi('apiFnName', [value1, value2]).then(function(result) {

    });
});
```

When the attempt for a connection is made, client B can register api functions for client A to call. Please refer to [[Connection.registerApi]].
Client B:
```JavaScript
client.onConnect(function(from, connection) {
    //connection
    connection.registerApi('apiFnName', function(param1, param2) {
        return result;
    });
});
```

#### Detailed example for connect
Client A:
```JavaScript
if (Messaging.isWorkplaceEnv()) {
        Messaging.getClient().then(function (client) {
            client.callApi('openApp', 'appB', {urlParam: 'value', multipleParams: [1, 2, 3]}).then(function (id) {
                // Application appB has been opened...

                // establish a message channel to currently opened instance of appB
                return Messaging.getClient().then(function (client) {
                    return client.callApi('connect', {id: id});
                });
            }).then(function (connection) {

                // Message Channel has been created

                connection.onClose(function () {

                    // Application appB has been closed...

                });

                // Call an API function that appB has registered on the connection
                return connection.callApi('getValue', param1, param2).then(function (value) {

                    // value from appB has been received

                    // close the message channel - this will not close the app
                    connection.close();

                });
            }).catch(function (reason) {
                console.error(reason);
            });

        });
    }
```

Client B:
```JavaScript
if(Messaging.isWorkplaceEnv()) {
    Messaging.getClient().then(function(client) {
        
        // Handle connections from other apps
        client.onConnect(function(from, connection) {
            
                       
            // optional: if connection is from appA
            if(from === 'appA') {
                
                // register a handler for the API function 'getValue'
                connection.registerApi('getValue', function(param1, param2) {
                    
                    // either return a value immediately or return a promise
                    
                    return new Promise(function(resolve, reject) {
                        
                        try {
                            // service method could be async
                            var result = myService.someMethod(param1, param2);
                            resolve(result);                           
                            
                        } catch(e) {
                            reject(e.message);
                        }                        
                    });
                    
                });
            }
            
        });
    });
}
```

#### Connecting to iframe widgets on a dashboard
In the workplace all iframe widgets of a dashboard are contained inside a group. This is to ensure
that widgets only communicate in the scope of the same dashboard. When a connection from outside the dashboard
has to be made, the app has no possibility to identify the correct group. Additionally multiple instances of a widget can exist on several dashboards.
To still be able to identify the correct widget, the function `connectAll` has been introduced.

```JavaScript
client.callApi('connectAll', {id: myWidgetId}).then(function(connections) {
     connections.forEach(function(con) {
        // do something
     });
})
```

<a name="#myworkplace-integration"></a>
## myWorkplace Integration
The Workplace API comes with a myWorkplace Test Environment which can be used to test app integration and API calls locally.

 ```
 git clone ssh://git@git.bmwgroup.net:7999/mwp/mwp-api.git
 cd mwp-api
 npm install && npm run build
 docker build . -t mwp-api
 docker run -p 8080:80 -d mwp-api
 ```
 
 If you want to use custom configuration, you should mount a volume that contains all of the workplace configuration files:
 
 ```
 docker run -p 8080:80 -d -v `pwd`/sample/assets/test:/usr/local/apache2/htdocs/assets/test mwp-api
 ```
 
 Browser location: [http://localhost:8080](http://localhost:8080)
 
### Webcomponents

The webcomponent's script files and their dependencies are located under `/sample/assets/components`:

#### File structure
```
components/
 ├──mycomponent/               * contains dependency files that will be loaded on demand by the seed script (optional)
 └──mycomponent.js             * seed script file that will initialize and load the components
```

#### Polyfills

Polyfills are provided by the npm package `@webcomponents/webcomponentsjs`
```
<script src="../node_modules/@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js"></script>
<script src="../node_modules/@webcomponents/webcomponentsjs/webcomponents-bundle.js"></script>
```

#### Configuration
Webcomponent widgets are defined in `/sample/assets/test/widgets.json`:
```json
{
    "id": "image1",
    "type": "web-component",
    "title": "My Image Widget",
    "colspan": 4,
    "rowspan": 4,
    "dataUrl": "/components/mwp.js",
    "customSettings": {
      "componentName": "mwp-image",
      "props": {
        "url": "./assets/images/bmw1.jpg",
        "dashboard": "custom"
      }
    }
  }
```
* `dataUrl` URL to the seed script of the webcomponent
* `customSettings.componentName` name of the custom element selector
* `props` a key/value object. For every key, a property will be set on the component instance with the given value

#### Workplace API
Webcomponent widgets have access to the Workplace API. A special prop `connection` is set on the component:
```javascript
// stencil.js syntax

@Component({
  tag: 'mwp-custom'
})
export class Custom {

  // connection is a special prop set by myWorkplace
   @Prop() connection: Connection;

  handleClick() {
    this.connection.callApi('openDashboard', {id: 'dashboard-1'});
  }
}
```

### Configuring your own app
To make your app available in the sample environment, you can edit the file `/sample/assets/test/apps.json`.
Add the following object to the JSON array and modify the properties so it fits your app:
```
{
    "name": "myApp",
    "description": "My App Title",
    "sortPosition": 1,
    "url": "http://example.com/path",
    "multipleWindows": false
}
```

### Configuration files

All configuration files are located under `sample/assets/test`

* `apps.json` Configure applications
* `dashboards.json` Create dashboards and add categories, widgets etc. to dashboard
* `widgets.json` Configure widgets
* `user.json` Change user attributes, business roles, etc.
* `appLayouts.json` Configure iframes in app layouts

### Mocking of dependent applications

To mock the api calls from/to another application, the following test pages can be used as a template:
* `/sample/assets/test/api-logger.html`: Use this template to register API functions that your app will be calling. It can return mock data.
* `/sample/assets/test/api-caller.html`: Use this template to open and call API function defined by your app

### iFrame Widgets
The sample features 2 preconfigured iFrame widgets that use Workplace API to communicate with each other.
The widgets are configured in the following file: `/sample/assets/test/widgets.json`

These attributes can be changed:
* `customSettings.title` Title of the widget
* `customSettings.url` URL that will be displayed in the iframe
* `colspan` Number of columns in the dashboard's grid
* `rowspan` Number of rows in the dashboard's grid

The widget IDs have to be added to the dashboard's widget array in the following files:
* `/sample/assets/test/dashboards.json`

Please make sure that your widget ID matches in both files.

### Splitted App Layouts
Layouts are configured in the following file: `/sample/assets/test/appLayouts.json`.
Currently only iFrame Widgets are supported in Layouts.


### VAAS Integration
The WebVis API can be called over Workplace Messaging.
To get an overview of the available API functions, please consult the WebVis Developer Manual.

Example: Adding an URN to the WebVis
```
webvisConnection.callApi('add', 'urn:bmw:prisma:dokuid:47625775');
```
The function `add` is provided by the WebVis API and is directly called over Messaging.

A sample implementation is provided in the app "Visualization" under `/sample/assets/test/visualization`.

The following is demonstrated in the sample app:
* opening and connecting to the app "vaas" (Compare `VisualizationController.js #138-#139`)
* adding a URN to the webvis (Compare `VisualizationController.js #20`)
* setting properties to display a node (Compare `VisualizationController.js #124`)
* selection of nodes (Compare `VisualizationController.js #104-#109`)
* handling events (Compare `VisualizationController.js #140-#141`)
* removing a node (Compare `VisualizationController.js #140-#141`)

#### WebVis Events
Events Listeners cannot be registered directly over Messaging, because functions are not transferable over a MessageChannel.
Therefore the app "vaas" assumes the opening app implements an API function called `eventListenerCallback`.
If an event is fired, it will always call this function.

Example `VisualizationController.js #138`:

```
client.callApi('openApp', 'vaas').then(function (id) {
    client.callApi('connect', {id: id}).then(function (connection) {
        connection.registerApi('eventListenerCallback', me.webvisEventListenerCallback.bind(me));
        connection.callApi('registerListener', [EventTypes.NODE_CHANGED, EventTypes.NODE_REMOVED]);
    });
});
```

In the example above, the event listener is registered as API function `eventListenerCallback` as soon as the connection to "vaas" is available.
The subsequent call to `registerListener` is missing the function parameter.

#### Running the Visualization Sample App
* Based on WebVis Test App: https://ltvaas1-web.bmwgroup.net/repo/webvis/webvis-app.html
* User must be logged into the B2B Portal prior to calling the sample app (link above)
* User needs access to the VAAS Test Environment (role Vaas_User)

<a name="#build"></a>
## Build

Requirements: 
* `node v10.x`
* `npm v6.x`

When building for the first time, run `npm install` on the project root.

To build the library and the api doc run `npm run build` on the project root.
The files will be generated in `/lib`.
An archive containing distribution files will be put under `/delivery`.

Documentation is generated under `/doc`

### Deploy doc on Openshift
Push the image to trigger redeployment on openshift:
```
cd doc
docker build . -t mwp-api-doc:0.3.1
docker login -u `oc whoami` -p `oc whoami -t` docker-registry-default.cnap-00-mp-dev.bmwgroup.net:443
docker tag mwp-api-doc docker-registry-default.cnap-00-mp-dev.bmwgroup.net:443/myworkplace-dev/mwp-api-doc
docker push docker-registry-default.cnap-00-mp-dev.bmwgroup.net:443/myworkplace-dev/mwp-api-doc
```

<a name="#roadmap"></a>
## Roadmap
* Support for whitelists and mwpOrigin param
* Prepare container for Openshift Deployment
* Declare all typings

<a name="#changelog"></a>
## Changelog
The current changelog is available on Bitbucket: [CHANGELOG.md](https://atc.bmwgroup.net/bitbucket/projects/MWP/repos/mwp-api/browse/CHANGELOG.md)


<a name="#contributors"></a>
## Contributors
* <a href="mailto:Tobias.Straller@bmw.de">Tobias Straller</a>
