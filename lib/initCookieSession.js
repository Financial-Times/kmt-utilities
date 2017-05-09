const cookieSession = require('cookie-session');
const config = require('./config');
//Set to expire 1min before apiAuth token lasts under licence_data scope.
const maxAge = 84924000; //23hrs 59mins

const sessionDetails = {
	name: 'FTKat',
	keys: [config.KMT_SECRET],
	domain: config.HOST,
	maxAge: maxAge
};

module.exports = cookieSession(sessionDetails);
