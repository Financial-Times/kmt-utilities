const cookieSession = require('cookie-session');
const config = require('./config');
//Cookie max age variant for environments 30mins prod 2 elseware
//TODO make config var?
//const maxAge = (config.NODE_ENV === 'production')? 30 : 2;

const sessionDetails = {
	name: 'FTKat',
		keys: [config.get('KMT_SECRET')],
		domain: config.get('HOST'),
		//maxAge: maxAge * 60 * 1000 //2mins TODO set to30mins
};

module.exports = cookieSession(sessionDetails);

/*

module.exports = {
	init: function(name) {
		return cookieSession({
			name: name,
			keys: [config.get('KMT_SECRET')],
			domain: config.get('HOST'),
			maxAge: 2 * 60 * 1000 //30mins
		});
	}
}
*/