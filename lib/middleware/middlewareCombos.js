module.exports = {
    defaultRoute: [
        require('./checkMaintenanceStatus'),
        require('./verifySession').getUserId,
        require('./getLicenceList'),
        require('./redirectDefaultLicence')
    ],
    mainRoute: [
        require('./checkMaintenanceStatus'),
        require('./verifySession').getUserId,
        require('./getLicenceId'),
        require('./checkLicenceStatus').isActive,
        require('./getAuthToken'),
        require('./isAdminSession').isAdminUser
    ]
};
