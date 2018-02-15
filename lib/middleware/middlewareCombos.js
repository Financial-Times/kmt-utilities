module.exports = {
	defaultRoute: [
		require('./noCache'),
		require('./checkMaintenanceStatus'),
		require('./verifySession').getUserId,
		require('./getLicenceList'),
		require('./redirectDefaultLicence')
	],
	mainRoute: [
		require('./noCache'),
		require('./checkMaintenanceStatus'),
		require('./verifySession').getUserId,
		require('./getLicenceId'),
		require('./checkLicenceStatus').isActive,
		require('./getAuthToken'),
		require('./isAdminSession').isAdminUser
	]
};
