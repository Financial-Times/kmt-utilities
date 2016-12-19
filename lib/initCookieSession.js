const cookieSession = require('cookie-session');
const config = require('./config');
//Cookie max age variant for environments 30mins prod 2 elseware
//TODO make config var?
//Set to expire 1min before apiAuth token lasts under licence_data scope.
const maxAge = 84924000; //23hrs 59mins //(config.NODE_ENV === 'production')? 30 : 2;
//

const sessionDetails = {
	name: 'FTKat',
		keys: [config.get('KMT_SECRET')],
		domain: config.get('HOST'),
		maxAge: maxAge
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