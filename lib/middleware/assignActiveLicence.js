const { acquisitionCtxClient } = require('@financial-times/kat-client-proxies');

const RE_FTCOM = /^FT\.com\s*/i;

function addLicenceAcquisitionData (licence) {
	return acquisitionCtxClient.getContexts({'access-licence-id': licence.licenceId})
		.then(result => {
			if (Array.isArray(result)) {
				const acquisitionCtx = result[0];
				if (acquisitionCtx !== undefined) {
					licence.displayName = acquisitionCtx.displayName || acquisitionCtx.name;
					licence.logoURI = acquisitionCtx.logoUrl;
                    licence.productAbbrv = licence.product ? licence.product.replace(RE_FTCOM, '') : '';// no need for `ft.com` in the abbr

					if (acquisitionCtx.barrierContext) {
						licence.signupURI = acquisitionCtx.barrierContext.redirectUrl;
					}
				}
			}

			return licence;
		});
}

module.exports = (req, res, next) => {
	const KATConfig = req.KATConfig;
	const activeLicenceId = req.params.licenceId;
	const licenceList = KATConfig.licenceList;

	KATConfig.activeLicence = licenceList.find(licence => licence.licenceId === activeLicenceId);

	if (KATConfig.activeLicence) {
		return addLicenceAcquisitionData(KATConfig.activeLicence)
			.then(result => {
				KATConfig.activeLicence = result;
				next();
			})
			.catch(next);
	}

	next();
};

module.exports.addLicenceAcquisitionData = addLicenceAcquisitionData;
