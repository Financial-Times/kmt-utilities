module.exports = (licenceArray) => {

    if (!Array.isArray(licenceArray)) {
        return licenceArray;
    }

    let listOfLicences = licenceArray.map((item) => {
        return {
            licenceId:item.id,
            creationDate: item.creationDateTime
        }
    });

    return listOfLicences.sort((a, b) => {
        return Date.parse(a.creationDateTime) - Date.parse(b.creationDateTime);
  });
}
