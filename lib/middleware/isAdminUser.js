module.exports = (req, res, next) => {
    const licenceAdminList = req.adminUserList.administrators;
    const currentUserId = req.currentUser.uuid;

    let adminCred;
    licenceAdminList.every(admin => {
        if (currentUserId && currentUserId === admin.id) {
            adminCred = admin;
            return false;
        }
        return true;
    });

    if (adminCred !== undefined) {
        req.adminCredentials = adminCred;
        return next();
    }

    const err = new Error('Unauthorised');
    err.status = 403;
    next(err);
};
