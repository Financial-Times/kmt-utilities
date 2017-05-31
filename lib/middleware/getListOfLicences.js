const accessLicenceClient = require('kat-client-proxies').accessLicenceClient;

module.exports = (req) => {
    return new Promise((resolve, reject) => {
        if (req.currentUser && req.currentUser.uuid) {
            if (Array.isArray(req.listOfLicences)) {
                return resolve(req.listOfLicences);
            }

            return accessLicenceClient.getLicences({adminuserid: req.currentUser.uuid})
                .then(response => {
                    if (Array.isArray(response)) {
                        req.listOfLicences = response
                            .map(item => ({
                                licenceId: item.id,
                                creationDate: item.creationDateTime,
                                status: item.status,
                                contractId: item.links[0].id,
                                product: item.products[0].name
                            }))
                            .filter(item => item.status === 'active');// remove the licences that are not active

                        return resolve(req.listOfLicences);
                    }

                    throw new Error('Invalid licence response.');
                })
                .catch(reject);
        }

        throw new Error('No user detected.');
    });
};
