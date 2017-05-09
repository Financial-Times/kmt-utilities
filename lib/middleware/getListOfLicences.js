const accessLicenceClient = require('kat-client-proxies').accessLicenceClient;

module.exports = (req) => {
    return new Promise(resolve => {
        if (req.currentUser && req.currentUser.uuid) {
            if (Array.isArray(req.listOfLicences)) {
                return resolve(req.listOfLicences);
            }

            return resolve(
                accessLicenceClient.getLicences({adminuserid: req.currentUser.uuid})
                    .then(response => {
                        if (Array.isArray(response)) {
                            req.listOfLicences = response.map(item => ({
                                licenceId: item.id,
                                creationDate: item.creationDateTime,
                                status: item.status,
                                contractId: item.links[0].id,
                                product: item.products[0].name
                            }));

                            return req.listOfLicences;
                        }

                        throw new Error('Invalid licence response.');
                    })
            );
        }

        throw new Error('No user detected.');
    });
};
