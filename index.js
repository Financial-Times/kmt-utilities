module.exports = {
	bodyParser: require('./lib/middleware/bodyParser.js'),
	checkLicenceStatus: require('./lib/middleware/checkLicenceStatus.js'),
	checkMaintenanceStatus: require('./lib/middleware/checkMaintenanceStatus.js'),
	errors: require('./lib/middleware/errors.js'),
	getAuthToken: require('./lib/middleware/getAuthToken.js'),
	getLicenceId: require('./lib/middleware/getLicenceId.js'),
	getLicenceList: require('./lib/middleware/getLicenceList.js'),
	getLicenceSeatsInfo: require('./lib/middleware/getLicenceSeatsInfo.js'),
	getListOfLicences: require('./lib/middleware/getListOfLicences.js'),
	getUserList: require('./lib/middleware/getUserList.js'),
	isAdminSession: require('./lib/middleware/isAdminSession.js'),
	isAdminUser: require('./lib/middleware/isAdminUser.js'),
	middlewareCombos: require('./lib/middleware/middlewareCombos.js'),
	myFtLicenceRegistration: require('./lib/middleware/myFtLicenceRegistration.js'),
	redirectDefaultLicence: require('./lib/middleware/redirectDefaultLicence.js'),
	redirectToExistingSession: require('./lib/middleware/redirectToExistingSession.js'),
	verifySession: require('./lib/middleware/verifySession.js'),
	cookieHandler: require('./lib/helpers/cookieHandler.js'),
	getErrorMessage: require('./lib/helpers/getErrorMessage.js'),
	isLicenceInList: require('./lib/helpers/isLicenceInList.js'),
	licenceListSort: require('./lib/helpers/licenceListSort.js'),
	config: require('./lib/config.js'),
	initCookieSession: require('./lib/initCookieSession.js'),
	logger: require('./lib/logger.js'),
	uriConstructor: require('./lib/uriConstructor.js'),
	assignActiveLicence: require('./lib/middleware/assignActiveLicence.js')
};
