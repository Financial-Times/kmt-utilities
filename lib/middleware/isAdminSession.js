const logger = require('../logger');
const licenceListSort = require('../helpers/licenceListSort');
const isLicenceInList = require('../helpers/isLicenceInList');
const getListOfLicences = require('./getListOfLicences');
const proxies = require('kat-client-proxies');
const accessLicenceClient = proxies.accessLicenceClient;
const licenceDataClient = proxies.licenceDataClient;

function setKATConfig(req, licenceList) {
    logger.info({operation: 'setKATConfig', result:'success', licenceList});

    return Object.assign({}, req.session.kmtLoggedIn, {licenceList: licenceList});
}

function getAdminUserList(req, res, next) {
    const operation = 'isAdminSession.getAdminUserList';
    logger.info({operation, requestParams: JSON.stringify(req.params)});

    return accessLicenceClient.getAdministrators(req.licenceId)
        .then(result => {
            req.adminUserList = result;
            next();
        })
        .catch(next);
}

function isAdminUser(req, res, next) {
    const currentUser = req.currentUser ? req.currentUser.uuid : undefined;
    const operation = 'isAdminSession.isAdminUser';
    logger.info({operation, licence: req.licenceId, currentUser});

    return getListOfLicences(req)
        .then(() => {
            if (req.session && req.session.isPopulated && Array.isArray(req.listOfLicences) && isLicenceInList(req.listOfLicences, req.licenceId)) {
                logger.info({operation, licence: req.licenceId, currentUser, FTKatSessionExist: req.session.isPopulated, licenceList: req.listOfLicences});

                return req.listOfLicences;
            }

            if (currentUser) {
                //get licence details
                return licenceDataClient.getAdminUserList(req.licenceId, req.apiAuthToken)
                    .then(userAdmins => {
                        const adminUserList = userAdmins.administrators;

                        //check user is an admin for this licence
                        if (adminUserList.some(user => user.id === currentUser) === false) {
                            //Not an admin user.
                            const err = new Error(`userId:${currentUser} is not an admin user on this licence`);
                            err.status = 403;
                            throw err;
                        }

                        let adminUser = 'unnamed';
                        adminUserList.every(item => {
                            if (item.id === currentUser) {
                                adminUser = item.email;
                                return false;
                            }
                            return true;
                        });

                        //set KAT session
                        req.session.kmtLoggedIn = {displayName: adminUser, userId: currentUser};

                        return req.listOfLicences;
                    });
            }

            const err = new Error('Missing licence credentials');
            err.status = 403;
            throw err;
        })
        .then(licenceListSort)
        .then(licenceList => {
            req.KATConfig = setKATConfig(req, licenceList);
            next();
        })
        .catch(next);
}

module.exports = {
    getAdminUserList,
    isAdminUser
};
