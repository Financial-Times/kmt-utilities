const cookieSession = require('cookie-session');
const config = require('./config');

const sessionDetails = {
	name: 'FTkmt',
		keys: [config.get('KMT_SECRET')],
		domain: config.get('DOMAIN')
};

module.exports = cookieSession(sessionDetails);
