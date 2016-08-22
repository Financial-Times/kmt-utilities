module.exports = (licences) => {
  if (!Array.isArray(licences)) {
    return licences;
  }

  return licences.sort((a, b) => {
    return Date.parse(a.creationDateTime) - Date.parse(b.creationDateTime);
  });
}
