module.exports = (req, res, next) => {
    return new Promise((resolve, reject) => {
        const licenceAdminList = req.adminUserList ? req.adminUserList.administrators || [] : [];
        const currentUserId = req.currentUser ? req.currentUser.uuid : undefined;

        let adminCred;
        licenceAdminList.every(admin => {
            if (currentUserId && currentUserId === admin.userId) {
                adminCred = admin;
                return false;
            }
            return true;
        });

        if (adminCred !== undefined) {
            req.adminCredentials = adminCred;
            next();

            return resolve(req.adminCredentials);
        }

        const err = new Error('Unauthorised');
        err.status = 403;
        next(err);
        return reject(err);
    });
};
