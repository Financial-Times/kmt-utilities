module.exports = (licenceArray) => {
    let listOfLicences = [];

    if (!Array.isArray(licenceArray)) {
        return licenceArray;
    }

    licenceArray.forEach(function(item) {
            listOfLicences.push({
            licenceId:item.id,
            creationDate: item.creationDateTime
        });
    });

  return listOfLicences.sort((a, b) => {
    return Date.parse(a.creationDateTime) - Date.parse(b.creationDateTime);
  });
}
