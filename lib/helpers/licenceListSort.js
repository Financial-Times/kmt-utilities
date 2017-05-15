module.exports = licenceArray => {
    if (!Array.isArray(licenceArray)) {
        return [];
    }

    return licenceArray
        .filter(item => item.status === 'active')
        .sort((a, b) => {
            return Date.parse(a.creationDateTime) - Date.parse(b.creationDateTime);
        });
};
