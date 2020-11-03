# Changelog

Changelog of myWorkplace Messaging API.
Style: https://keepachangelog.com/en/1.0.0/

## [0.3.2] - UNRELEASED
- updated registry URL in readme
- describe installation without npm

## [0.3.1] - 20.03.2019
- support custom error object when rejecting the promise of an api function
- updated workplace container

## [0.3.0] - 29.01.2019
Starting with version 0.3.0 the library is published as npm package, which makes adding it as a dependency to your project easier.
There have not been introduced any breaking changes, so older versions of the library will still work in myWorkplace environment.

### Added
- export of generated typescript declarations - including comments for autocompletion
- generated source maps

### Changed
- updated dev dependencies (typescript@3, webpack@4)
- moved changelog to separate file and changed format
- changed resource root of myWorkplace container from `/mwp-api/sample` to `/`

### Removed
- dev dependency gulp

## [0.2.11] - 21.12.2018
* isWorkplaceEnv() to work without URL param

## [0.2.10] - 30.10.2018
* Included Dockerfile for myWorkplace test environment
* Updated README.md with information on docker builds
* [[Host.createLocalConnection]] for webcomponents
* Included webcomponent widget support

## [0.2.9] - 04.09.2018
* Update workplace container (openDashboard, openLayout)
* Fix getConnection for connection groups (affects only host applications)

## [0.2.8] - 28.03.2018
* Fix for multiple window issue in workplace

## [0.2.7] - 28.03.2018
* Updated workplace container: openApp with split view

## [0.2.6] - 02.02.2018
* Updated workplace container: Layouts, getTabInfo 

## [0.2.5] - 19.01.2017
* Updated workplace container including the following Workplace API functions: closeTab, getTabId

## [0.2.4] - 22.12.2017
* Update of workplace container including: drag&drop, createFavorite
* Changed `RewriteBase` in .htaccess from `/itowp_api` to `/mwp-api`. This might affect your local apache setup! For instructions please refer to readme-sample.doc.
* Updated readme-sample.md for more details on Apache installation

## [0.2.3] - 14.11.2017
* automatically detect host window if client has been opened in new window
* Introduced [[Client.unregisterApi]]
* Added polyfill for Object.assign

## [0.2.2] - 23.10.2017
* bugfix for javascript error "Die Eigenschaft "map" eines undefinierten oder Nullverweises kann nicht abgerufen werden."

## [0.2.1] - 19.09.2017
* added api function `connectAll` which returns an array of connections in case of multiple instances with the same id (e.g. widget on multiple dashboards)

## [0.2.0] - 14.06.2017
No breaking changes.
* New feature: Connection grouping for hosts
* Bugfix: removed unhandled exception being caused by empty data response
* Sample: Latest iFrame Widgets, roleChanged event, Test App: `Test Workplace API`

## [0.1.10] - 12.04.2017
* Sample: Updated Workplace API Test App to include beforeClose and close Events
* Workplace API function 'openApp' overloaded to support config object
* Updated Workplace Sample

## [0.1.9] - 16.03.2017
* Bugfix: onClose event being triggered when opener app is being closed
* Sample: Included iFrame widgets on dashboard

## [0.1.8] - 17.02.2017
* Documentation: Extensive example for 'connect'
* Readme Sample: Using mock templates
* Included 2 mock templates to Workplace Sample: api-logger.html and api-caller.html

## [0.1.7] - 20.01.2017
* Introduced [[Messaging.getClient]] to cache a client instance, this is preferred to using Messsaging.createClient
* Introduced [[IClientConfig]] options that can be set on the Messaging instance
* Updated Workplace Sample

## [0.1.6] - 15.07.2016
* Updated Workplace Sample
* Bugfix for removed connections

## [0.1.5] - 13.07.2016
* Bugfix for closing client connections on page navigation.

## [0.1.4] - 30.05.2016
* Bugfix for api call results that return the value `false`
* Error on origin check will be logged
* Sample for VAAS integration

## [0.1.3] - 30.03.2016
* Update Workplace Sample for Deeplink URLs (~ Separator and /refresh route)

## [0.1.2] - 02.03.2016
* Support clients that are created asynchronously
* Helper function for workplace environment check: [[Messaging.isWorkplaceEnv]]

## [0.1.1] - 23.02.2016
Implemented changes suggested by project FLS:
* [[Messaging.createClient]] is now returning a promise
* [[Messaging.createClient]] now takes a config object which is optional
* [[Client.callApi]] and [[Connection.callApi]] use spread arguments for api function parameters instead of array
* Added sample to check for workplace environment by url parameter `env=workplace`

## [0.1.0] - 12.02.2016
Initial Version
