# kmt-utilities
Common middleware and server side helpers for KAT microservices.

KAT (Knowledge & administration tools) is an ft.com application created for Financial Times B2B clients.

## Usage
```sh
npm install --save @financial-times/kmt-utilities
```

Example using the `initCookieSession` middleware. See `index.js` for exposed functions.
```js
const { initCookieSession } = require('@financial-times/kmt-utilities');

app.use(initCookieSession);
```

An API key for the services in this package is required. Details on obtaining one for your application can be found in the [membership api gateway](https://developer.ft.com/docs/membership_platform_api/) guide.


## Development
```
git clone git@github.com:Financial-Times/kmt-utilities.git
cd kmt-utilities
make install
```

### Environment Variables
```
make .env
```

### Tests
```
make test
```
