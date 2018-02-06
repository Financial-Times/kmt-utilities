const { acquisitionCtxClient } = require('@financial-times/kat-client-proxies');
const logger = require('@financial-times/n-logger').default;

const RE_FTCOM = /^FT\.com\s*/i;

function _addLicenceAcquisitionData (licence) {
	licence.displayName = null;
	licence.productAbbrv = licence.product ? licence.product.replace(RE_FTCOM, '') : '';// no need for `ft.com` in the abbr;
	licence.signupURI = null;

	return acquisitionCtxClient.getContexts({'access-licence-id': licence.licenceId})
		.then(result => {
			logger.info({operation:'_addLicenceAcquisitionData  ', licenceId: licence.licenceId, result: JSON.stringify(result)});
				if (result.AcquisitionContext) {
					const acx = result.AcquisitionContext;
					logger.info({operation:'_addLicenceAcquisitionData  ', licenceId: licence.licenceId, acx: JSON.stringify(acx)});
					licence.displayName = acx.displayName || acx.name;
					licence.signupURI = (acx.barrierContext && acx.barrierContext.redirectUrl)? acx.barrierContext.redirectUrl : null;
				}

			return licence;
		})
		.catch((err) => {
			logger.error({operation:'addLicenceAcquisitionData',licenceId: licence.licenceId, status:err.name}, err);

			if(err.name === 'NotFoundError') {
				return licence;
			}
			throw err;
		});
}

module.exports = (req, res, next) => {
	const KATConfig = req.KATConfig;
	const activeLicenceId = req.params.licenceId;
	const licenceList = KATConfig.licenceList;

	KATConfig.activeLicence = licenceList.find(licence => licence.licenceId === activeLicenceId);
	logger.info({operation:'assignActiveLicence ', licenceObject: JSON.stringify(KATConfig.activeLicence)});
	if (KATConfig.activeLicence) {
		return _addLicenceAcquisitionData(KATConfig.activeLicence)
			.then(result => {
				logger.info({operation:'assignActiveLicence ', licenceObject: JSON.stringify(result)});
				KATConfig.activeLicence = result;
				logger.info({operation:'assignActiveLicence ', licenceObject: JSON.stringify(KATConfig.activeLicence)});
				next();
			})
			.catch(next);
	} else {
		logger.info({operation:'assignActiveLicence ', licenceObject: JSON.stringify(KATConfig)});
	}

	next();
};
