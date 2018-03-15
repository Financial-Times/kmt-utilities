const compression = require('compression');

module.exports = {
	defaultRoute: [
		compression(),
		require('./noCache'),
		require('./checkMaintenanceStatus'),
		require('./verifySession').getUserId,
		require('./getLicenceList'),
		require('./redirectDefaultLicence')
	],
	mainRoute: [
		compression(),
		require('./noCache'),
		require('./checkMaintenanceStatus'),
		require('./verifySession').getUserId,
		require('./getLicenceId'),
		require('./checkLicenceStatus').isActive,
		require('./getAuthToken'),
		require('./isAdminSession').isAdminUser
	]
};
