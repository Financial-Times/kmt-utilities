'use strict';
const logger = require('../logger');
const accessLicenceService = require('../services/accessLicenceService');

function* getLicenceList(req, res, next) {
    const adminUserId = req.currentUser.uuid;
  try {
    const response = yield accessLicenceService.getLicenceList({adminuserid:adminUserId});
    const accessLicences = response.accessLicences;
    logger.info({operation:'getLicenceList', accessLicencesIsArray: Array.isArray(accessLicences), numberOfLicencesReturned:accessLicences.length});

    if ( typeof accessLicences === 'undefined' || accessLicences.length < 1) {
        logger.info({operation:'LicenceOfList', result:'failed', reason:'User is not associated with any licences'});
    }
    let listOfLicences = [];
     accessLicences.forEach(function(item) {
        listOfLicences.push({
            licenceId:item.id,
            creationDate: item.creationDateTime
        });
     });

    logger.info({operation:'LicenceOfList', listOfLicences:JSON.stringify(listOfLicences)});
    req.listOfLicences = listOfLicences;

    next();
  } catch (err) {
    logger.info({operation:'getLicenceList', result:'failed'});
    next(err);
  }
};

module.exports = getLicenceList;


