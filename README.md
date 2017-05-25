# kmt-utilities
Common middleware for KAT microservices.

KAT (Knowledge & administration tools) is an ft.com application created for Financial Times B2B clients.

## Getting started
To get a copy of the project up and running on your local machine for development and testing purposes run `$ git clone git@github.com:Financial-Times/kmt-utilities.git` and `$ npm install`.

Use the `.env` file saved in LastPass to set up necessary environmental variables (feel free to approach KAT team via `#ft-syndikat` slack channel if you have any questions or access issues).

## Testing

[TBD - when new tests are implemented]

## Deployment
This module has been created to be included throughout other KAT components.

### How to update a repo that uses the module to the new version
If you want to update connected components with the latest version, you need to follow the following steps:
1. Create a new repository release on GitHub. Please follow the naming convention of previous releases.
2. Go to `package.json` file of the component you want to update, and change `"kmt-utilities"` dependency version to the [newly released one](https://github.com/Financial-Times/kmt-utilities/releases).

The following KAT components are currently using `kmt-utilities`:
 - [kmt-overview](https://github.com/Financial-Times/kmt-overview)
 - [kmt-myft](https://github.com/Financial-Times/kmt-myft)
 - [kat-usage-report](https://github.com/Financial-Times/kat-usage-report)

### How to use the module

#### Installation guide

Include `"kmt-utilities": "financial-times/kmt-utilities#v[LATEST_RELEASE_VERSION]"` as a dependency in your package.json. [Information about the latest version](https://github.com/Financial-Times/kmt-utilities/releases).

An API key for the services in this package is required. Details on obtaining one for your application can be found in the [membership api gateway](https://developer.ft.com/docs/membership_platform_api/) guide.

#### Usage

In your application wherever you would like to use kat-utilities middleware, include the path to the code you want to use:

```js
  //... your app code
  const initCookieSession = require('kmt-utilities/lib/initCookieSession');
  // ... or
  const [middlewareName] = require('kmt-utilities/lib/middleware/[middlewareName]');
  // ... and then e.g.
  app.use(initCookieSession);
```
