const {accessLicenceClient, acquisitionCtxClient} = require('@financial-times/kat-client-proxies');

module.exports = (req) => {
	return new Promise((resolve, reject) => {
		if (req.currentUser && req.currentUser.uuid) {
			if (Array.isArray(req.listOfLicences)) {
				return resolve(req.listOfLicences);
			}

			return accessLicenceClient.getLicences({adminuserid: req.currentUser.uuid})
				.then(response => {
					if (Array.isArray(response)) {
						const promises = [];
						req.listOfLicences = response
							.map(item => ({
								licenceId: item.id,
								creationDate: item.creationDateTime,
								status: item.status,
								contractId: item.links[0].id,
								product: item.products[0].name
							}))
							.filter(item => item.status === 'active');// remove the licences that are not active

						req.listOfLicences.forEach(item => {
							promises.push(
								acquisitionCtxClient.getContexts({'access-licence-id': item.licenceId})
									.catch (() => [])
									.then (infoItem => {
										item.name = '-';
										if (infoItem) {
											item.name = infoItem.name || infoItem.displayName;
										}
									})
							);
						});

						return resolve(Promise.all(promises).then(() => req.listOfLicences));
					}

					throw new Error('Invalid licence response.');
				})
				.catch(reject);
		}

		throw new Error('No user detected.');
	});
};
