const logger = require('../logger');

module.exports = function(currentLicencelist, activeLicence) {
  if (currentLicencelist.some(licence => licence.licenceId === activeLicence)) {
    logger.info({operation:'isLicenceInList', activeLicence:activeLicence ,IsInList: 'true'});
    return true;
  }
  logger.info({operation:'isLicenceInList', activeLicence:activeLicence ,IsInList: 'false'});
  return false;
};
