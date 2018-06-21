const {accessLicenceClient, acquisitionCtxClient} = require('@financial-times/kat-client-proxies');

module.exports = (req) => {
	if (!req.currentUser || !req.currentUser.uuid) {
		const error = new Error('No user detected.');
		return Promise.reject(error);
	}

	if (Array.isArray(req.listOfLicences)) {
		return Promise.resolve(req.listOfLicences);
	}

	return accessLicenceClient.getLicences({adminuserid: req.currentUser.uuid})
		.then(licences => {
			if (!Array.isArray(licences)) {
				throw new Error('Invalid licence response.');
			}

			const activeLicences = licences.filter(licence => licence.status === 'active');

			const promises = activeLicences.map(licence => {
				return acquisitionCtxClient.getContexts({'access-licence-id': licence.id})
					.catch(() => ({})) // hmm, probably want to log something here
					.then(context => {
						return {
							name: context.name || context.displayName || '-',
							licenceId: licence.id,
							creationDate: licence.creationDateTime,
							status: licence.status,
							contractId: licence.links && licence.links[0] && licence.links[0].id,
							product: licence.products && licence.products[0] && licence.products[0].name
						};
					});
			});

			return Promise.all(promises)
				.then(licences => {
					req.listOfLicences = licences;
					return licences;
				});
		});

};
