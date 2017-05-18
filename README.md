# kmt-utilities
Common middleware for Knowledge Manager Tools (KMT) microservices

## Installation guide

Include ``"kmt-utilities": "financial-times/kmt-utilities"``as a dependency in your package.json

Set up a utilities.Config.js to pass any of the process.env values you want to to the utilities middleware. It should look something like this:

    module.exports = {
        API_GATEWAYKEY:  process.env.API_GATEWAYKEY,
        SESSION_API_HOST:process.env.SESSION_API_HOST
    };

An API key for the services in this package is requried. Details on obtaining one for your application can be found in the [membership api gateway](https://developer.ft.com/docs/membership_platform_api/) guide.

## Usage

In your applicaition entry point (so app.js, server.js or index.js) require the utils package, utilities.Config.js and the initCookieSession:

    //... your app code
	const kmtUtils = require('kmt-utilities');
	const utilConfig = require('../utilitiesConfig');

	kmtUtils.initialise(utilConfig);
    //... your app code cont...

    app.use(kmtUtils.initCookieSession);


For each place you require kmt middleware or services you will need to requre:

    const kmtUtils = require('kmt-utilities');

Then call whatever service you require from the module:

	let aThing = kmtUtils.ServiceName.module(args);
