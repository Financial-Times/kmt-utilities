const { acquisitionCtxClient } = require('@financial-times/kat-client-proxies');
const logger = require('@financial-times/n-logger').default;

const RE_FTCOM = /^FT\.com\s*/i;

function _addLicenceAcquisitionData (licence) {
	const operation = 'addLicenceAcquisitionData';
	licence.displayName = licence.displayName ? licence.displayName: null;
	licence.productAbbrv = licence.product ? licence.product.replace(RE_FTCOM, '') : '';// no need for `ft.com` in the abbr;
	licence.signupURI = licence.signupURI? licence.signupURI : null;

	return acquisitionCtxClient.getContexts({'access-licence-id': licence.licenceId})
		.then(acx => {
			logger.info({operation, licenceId: licence.licenceId, acxId: acx.id});
				if (acx) {
					licence.displayName = acx.displayName || acx.name;
					licence.signupURI = (acx.barrierContext && acx.barrierContext.redirectUrl)? acx.barrierContext.redirectUrl : null;
				}

			return licence;
		})
		.catch((err) => {
			logger.error({operation,licenceId: licence.licenceId, status:err.name}, err);

			if(err.name === 'NotFoundError') {
				return licence;
			}
			throw err;
		});
}

module.exports = (req, res, next) => {
	const operation = 'assignActiveLicence';
	const KATConfig = req.KATConfig;
	const activeLicenceId = req.params.licenceId;
	const licenceList = KATConfig.licenceList;

	KATConfig.activeLicence = licenceList.find(licence => licence.licenceId === activeLicenceId);
	if (KATConfig.activeLicence) {
		return _addLicenceAcquisitionData(KATConfig.activeLicence)
			.then(result => {
				KATConfig.activeLicence = result;
				logger.info({operation, licenceObject: JSON.stringify(KATConfig.activeLicence)});
				next();
			})
			.catch(err => {
				logger.error({operation, activeLicenceId}, err);
				next(err);
			});
	} else {
		const err = new Error(`${activeLicenceId} does not exist in licence list`);
		logger.error({operation, activeLicenceId}, err);

		throw err;
	}

	next();
};
