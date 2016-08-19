'use strict';
const logger = require('../logger');
const accessLicenceService = require('../services/accessLicenceService');

function* getLicenceList(req, res, next) {
    const adminUserId = req.currentUser.uuid;
  try {
    const response = yield accessLicenceService.getLicenceList({adminuserid:adminUserId});
    const accessLicences = response.accessLicences;
    logger.info({operation:'getLicenceList', licenceData: Array.isArray(accessLicences)});

    let listOfLicences = [];
     accessLicences.forEach(function(item) {
        listOfLicences.push(item.id);
     });

    logger.info({operation:'LicenceOfList', listOfLicences:listOfLicences});
    req.listOfLIcences = listOfLicences;

    next();
  } catch (err) {
    logger.info({operation:'getLicenceList', result:'failed'});
    next(err);
  }
};

module.exports = getLicenceList;


