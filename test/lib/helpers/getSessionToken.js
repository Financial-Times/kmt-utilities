// TODO - Move this somewhere else as it isn't a test. I would expect tests for helpers in this folder. (AJ)
let sessionToken = undefined;
const uuids = require('kat-client-proxies/test/mocks/uuids');

module.exports = () => {
    if (sessionToken === undefined) {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'FT_Api_Key': process.env.SESSION_SERVICE_APIKEY,
                'Accept': '*/*',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({uuid: uuids.validUser})
        };
        return fetch(process.env.SESSION_SERVICE_URL, options)
            .then(response => response.text())
            .catch(() => '')
            .then(token => {
                sessionToken = token;
                return sessionToken;
            });
    }
    return new Promise(resolve => resolve(sessionToken));
};
