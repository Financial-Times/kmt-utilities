const {accessLicenceClient, acquisitionCtxClient} = require('@financial-times/kat-client-proxies');
const logger = require('@financial-times/n-logger').default;

module.exports = (req) => {
	const operation = 'getListOfLicences';

	if (!req.currentUser || !req.currentUser.uuid) {
		const error = new Error('No user detected.');
		logger.error({ operation, currentUser: req.currentUser }, error);
		return Promise.reject(error);
	}

	if (Array.isArray(req.listOfLicences)) {
		logger.info({ operation, msg: 'req.listOfLicences already exists', licences: JSON.stringify(req.listOfLicences) });
		return Promise.resolve(req.listOfLicences);
	}

	return accessLicenceClient.getLicences({adminuserid: req.currentUser.uuid})
		.then(licences => {
			if (!Array.isArray(licences) || !licences.length) {
				const error = new Error('Invalid licence response.');
				logger.error({ operation, action: 'getLicence', msg: error.message, licences }, error);
				throw error;
			}

			const activeLicences = licences.filter(licence => licence.status === 'active');

			const promises = activeLicences.map(licence => {
				const licenceId = licence.id;

				return acquisitionCtxClient.getContexts({'access-licence-id': licenceId})
					.catch(error => {
						logger.warn({ operation, msg: `Issue getting context for licence ${licenceId}`, licenceId }, error);
						return {};
					})
					.then(context => {
						return {
							name: context.name || context.displayName || '-',
							licenceId: licenceId,
							creationDate: licence.creationDateTime,
							status: licence.status,
							contractId: licence.links && licence.links[0] && licence.links[0].id,
							product: licence.products && licence.products[0] && licence.products[0].name
						};
					});
			});

			return Promise.all(promises)
				.then(licences => {
					logger.info({ operation, msg: 'Assigning licences to request', licences: JSON.stringify(licences) });
					req.listOfLicences = licences;
					return licences;
				});
		});

};
