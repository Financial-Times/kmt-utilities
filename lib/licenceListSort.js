
const RE_FTCOM = /^FT\.com\s*/i;

module.exports = (licenceArray) => {

    if (!Array.isArray(licenceArray)) {
        return licenceArray;
    }

    function checkLicenceStatus(licence) {
        if (licence.status === 'active') {
            return licence;
        }
    }

    let listOfLicences = licenceArray.filter(checkLicenceStatus).map((licence) => {
        return {
            licenceId:licence.id,
            creationDate: licence.creationDateTime,
            contractId:licence.links[0].id,
            product: licence.products[0].name,
            productAbbrv: licence.products[0].name.replace(RE_FTCOM, '')
        }
    });

    return listOfLicences.sort((a, b) => {
        return Date.parse(a.creationDateTime) - Date.parse(b.creationDateTime);
  });
}
