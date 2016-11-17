const logger = require('../logger');
const uriConstructor = require('../uriConstructor');

function canWithstand(error) {
  switch (error.code) {
    case 'ETIMEDOUT':
      logger.log('error',{operation:'Connection timed out', error:error});
      return true;
    default:
      return false;
  }
}

function _renderError(err, req, res, next, noStack) {
  res.status(err.status || 500);
  logger.log('error', {'Application error': err.message});
  logger.log('error', {'Error stack': err.stack});

  const errorData = {message: err.message};
  if (noStack !== true) {
    errorData.error = err.stack;
  }
    res.render('errors', errorData);
}

function _isAuthenticationError(err, req, res, next, noStack) {
  if (err.status === 401) {
    logger.log('warn', {'Unauthorized': 'Invalid user credentials'});
    logger.log('warn', {'Error stack': err.stack});
    res.redirect(uriConstructor.redirectUrl(req.originalUrl));
  } else {
    _renderError(err, req, res, next, noStack);
  }
}

function devMiddleware(err, req, res, next) {
  _isAuthenticationError(err, req, res, next);
}

function middleware(err, req, res, next) {
  _isAuthenticationError(err, req, res, next, true);
}

function onUncaughtException(error) {
  if (canWithstand(error)) {
    return;
  }
  logger.log('error', {'Uncaught exception':'process will exit', error:error});
  setImmediate(process.exit.bind(null, 66), 1000);// eslint-disable-line no-undef
}

module.exports = {
  middleware: middleware,
  devMiddleware: devMiddleware,
  onUncaughtException: onUncaughtException
};
