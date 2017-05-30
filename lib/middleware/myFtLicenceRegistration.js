const logger = require('./../logger');
const Promise = require('bluebird');
const proxies = require('kat-client-proxies');
const myFt = proxies.myFTClient;
const alc = proxies.accessLicenceClient;
const clientErrors = proxies.clientErrors;
const maxRetry = 5;
const registerRetryCount = {};
const noUserEvents = process.env.MYFT_NO_EVENT || 'true';
const userBatchNr = parseInt((process.env.BATCH_USER_COUNT || 5), 10);
const userConcurrency = parseInt((process.env.BATCH_USER_CONCURRENCY || 5), 10);

function checkAndRegister(req, res, next, runInBackground = false) {
  const operation = 'myFtRegistrationMiddleware.checkAndRegister';
  const userStr = JSON.stringify(req.currentUser);

  logger.debug({operation, licenceId: req.licenceId, currentUser: userStr});

  // if it needs to be ran in the bg
  if (runInBackground === true) {
    // skip to the next middleware and let this one run in the background
    next();
  }

  if (req.licenceId !== undefined && req.currentUser !== undefined && req.currentUser.uuid !== undefined) {
    return myFt.getLicence(req.licenceId)
      .catch(error => {
        // if the licence is not found
        if (error instanceof clientErrors.NotFoundError) {
          return {};
        }

        throw error;
      })
      .then(response => {
        // if we get the licence data and if it has our custom flag => no need to register
        if (response.uuid === req.licenceId && response.kmtRegistrationDate !== undefined) {
          logger.debug({operation, msg: 'Licence up-to-date', licenceId: req.licenceId, currentUser: userStr});
          return null;
        }

        logger.debug({operation, msg: 'Licence needs to be registered', licenceId: req.licenceId, currentUser: userStr});

        // register the licence
        return _register(req.licenceId, req.currentUser.uuid, response);
      }).then(response => {
        // if it doesn't need to be ran in the bg
        if (runInBackground !== true) {
          next();
        }
        return response;
      }).catch(error => {
        logger.error({operation, licenceId: req.licenceId, currentUser: userStr, error});

        // if it doesn't need to be ran in the bg
        if (runInBackground !== true) {
          next(error);
        }
      });
  }

  // if it doesn't need to be ran in the bg
  if (runInBackground !== true) {
    const error = new Error("Invalid licence or user");
    logger.error({operation: 'licenceStatus.checkAndRegister', licenceId: req.licenceId, currentUser: userStr, error});
    next(error);
    return Promise.reject(error);
  }
}

function _register(licenceId, currentUserId, licenceData) {
  const operation = 'myFtRegistrationMiddleware.register';
  logger.debug({operation, licenceId, currentUserId});

  const relProps = Object.assign({}, myFt.relationshipProperties);
  relProps.byUser = currentUserId;

  // initialize the counter
  if (registerRetryCount[licenceId] === undefined) {
    registerRetryCount[licenceId] = 0;
  }

  return new Promise(resolve => {
      // if we have the licence data
      if (licenceData.uuid === licenceId) {
        logger.debug({operation, msg: 'Licence data up-to-date', licenceId, currentUserId});
        return resolve(null);
      }

      logger.debug({operation, msg: 'Licence data needs to be registered', licenceId, currentUserId});
      // register the licence to myft
      return resolve(myFt.addLicence(licenceId));
    })
    .then(() => {
      return myFt.getGroupFromLicence(licenceId, licenceId)// check group relationship with licence
        .catch(error => {
          // if the licence is not found
          if (error instanceof clientErrors.NotFoundError) {
            return {};
          }

          throw error;
        });
    })
    .then(relationData => {
      // if we get the licence details
      if (relationData.uuid === licenceId) {
        logger.debug({operation, msg: 'Group data up-to-date', licenceId, currentUserId});
        return null;
      }

      logger.debug({operation, msg: 'Group data needs to be registered', licenceId, currentUserId});
      // register the group to myft
      return myFt.addGroupsToLicence(licenceId, licenceId, relProps);
    })
    .then(() => _getNewUsers(licenceId))
    .then(([newLicenceUsers, newGroupUsers] = [...params]) => {// eslint-disable-line no-undef
      logger.debug({operation, msg: 'Users that are going to be added:', newLicenceUsers: newLicenceUsers.length, newGroupUsers: newGroupUsers.length, licenceId, currentUserId});
      return _setUsers(licenceId, newLicenceUsers, newGroupUsers, relProps);
    })
    //.then(([licenceUserRes, groupUserRes] = [...params]) => {// eslint-disable-line no-undef
    .then(() => {
      logger.debug({operation, msg: 'Mark licence as registered', licenceId, currentUserId});
      return myFt.updateLicence(licenceId, {"kmtRegistrationDate": new Date().getTime()});
    })
    .then(res => {
      delete registerRetryCount[licenceId];// reset the counter
      return res;
    })
    .catch(error => {
      // retry the request
      if (registerRetryCount[licenceId] < maxRetry) {
        registerRetryCount[licenceId]++;

        logger.debug({operation, msg: `Retry #${registerRetryCount[licenceId]}`, licenceId, currentUserId});

        return _register(licenceId, currentUserId, licenceData);
      }
      delete registerRetryCount[licenceId];// reset the counter
      throw error;
    });
}

function _getNewUsers(licenceId) {
  const operation = 'myFtRegistrationMiddleware.getNewUsers';
  logger.debug({operation, licenceId});

  const catchFn = error => {
    // if the licence is not found
    if (error instanceof clientErrors.NotFoundError) {
      return [];
    }

    throw error;
  };

  // get membership users for this licence
  const membershipDataPromise = alc.getSeats(licenceId);
  // get myFT users for this licence
  const myftLicenceDataPromise = myFt.getUsersForLicence(licenceId).catch(catchFn);
  // get myFT users for this group
  const myftGroupDataPromise = myFt.getUsersForGroup(licenceId).catch(catchFn);

  // get the new users by comparing membershipData with myftData
  return Promise.join(
    membershipDataPromise,
    myftLicenceDataPromise,
    myftGroupDataPromise,
    (membershipData, myftLicenceData, myftGroupData) => {
      return _extractNewUsers(myftLicenceData, myftGroupData, membershipData);
    });
}

function _extractNewUsers(myftLicenceData, myftGroupData, membershipData) {
  const operation = 'myFtRegistrationMiddleware.extractNewUsers';
  logger.debug({operation});

  let newLicenceUsers = [];
  let newGroupUsers = [];
  // if the seatHolders are received
  if (Array.isArray(membershipData)) {
    // extract the ones that are not already added
    newLicenceUsers = _filterExistingUsers(membershipData, myftLicenceData);
    // extract the ones that are not already added
    newGroupUsers = _filterExistingUsers(membershipData, myftGroupData);
  }

  return [newLicenceUsers, newGroupUsers];
}

function _filterExistingUsers(seatHolders, existing) {
  return seatHolders.filter((user) => {
    // if there are no items or if this id is not already added
    return !(Array.isArray(existing)) || !(existing.some((item) => item.uuid === user.userId));
  });
}

function _setUsers(licenceId, newLicenceUsers, newGroupUsers, relProps) {
  const operation = 'myFtRegistrationMiddleware.setUsers';
  const newLicenceUsersLen = newLicenceUsers.length;
  const newGroupUsersLen = newGroupUsers.length;

  logger.debug({operation, licenceId, newLicenceUsers: newLicenceUsersLen, newGroupUsers: newGroupUsersLen});

  const userLicenceData = newLicenceUsers.map(user => user.userId);
  const userGroupData = newGroupUsers.map(user => user.userId);

  let licencePromise;
  let groupPromise;
  if (newLicenceUsersLen > 0) {
    licencePromise = _setUsersInChunks(userLicenceData, licenceId, relProps, "Licence");
  } else {
    licencePromise = new Promise(resolve => resolve(null));
  }
  if (newGroupUsersLen > 0) {
    groupPromise = _setUsersInChunks(userGroupData, licenceId, relProps, "Group");
  } else {
    groupPromise = new Promise(resolve => resolve(null));
  }

  return Promise.join(licencePromise, groupPromise, (...results) => results);
}

function _setUsersInChunks(userData, licenceId, relProps, type) {
  const operation = 'myFtRegistrationMiddleware.setUsersInChunks';
  logger.debug({operation, type, licenceId});
  const userDataClone = [...userData];
  const options = {noEvent: noUserEvents};
  const chunksArr = [];

  // while we still have users
  while (userDataClone.length) {
    // get the chunk
    chunksArr.push(userDataClone.splice(0, userBatchNr));
  }

  return Promise.map(chunksArr, (chunk, i) => {
    logger.debug({operation, msg: `Chunk #${i}`, type, licenceId});

    // trigger the request
    const fnName = `addUsersTo${type}`;
    if (typeof myFt[fnName] === "function") {
      return myFt[fnName](licenceId, chunk, relProps, options);
    }
    return null;
  }, {concurrency: userConcurrency});
}

module.exports = {
  checkAndRegister
};
