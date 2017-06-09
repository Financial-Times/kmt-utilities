
const logger = require('../logger');
const uriConstructor = require('../uriConstructor');
const config = require('../config');
const getErrorMessage = require('../helpers/getErrorMessage');

function canWithstand(error) {
  switch (error.code) {
    case 'ETIMEDOUT':
      logger.log('error',{operation:'Connection timed out', error:error});
      return true;
    default:
      return false;
  }
}

function _applicationError(err, req, res, next) {
  err.status = err.status || 500;

  logger.log('error', {'Application error': err.message});
  logger.log('error', {'Error stack': err.stack});

  next(err);

  return Promise.resolve();
}

function _authenticationError(err, req, res, next) {
  logger.log('warn', {'Unauthorized': 'Invalid user credentials'});
  logger.log('warn', {'Error stack': err.stack});

  return fetch(config.LOGOUT_URL, { headers: req.headers })
    .then(() => {
      res.redirect(uriConstructor.redirectUrl(req));
    });
}

function middleware(err, req, res, next) {
  if (err.status === 401) {
    return _authenticationError(err, req, res, next);
  } else {
    return _applicationError(err, req, res, next);
  }
}

function onUncaughtException(error) {
  if (canWithstand(error)) {
    return;
  }
  logger.log('error', {'Uncaught exception':'process will exit', error:error});
  setImmediate(process.exit.bind(null, 66), 1000);// eslint-disable-line no-undef
}

function renderView(err, req, res, next) {
  const statusCode = err.status || 500;
  const errorMessages = getErrorMessage(statusCode);

  const data = {
    DEV_ADD_LIVERELOAD: config.DEV_ADD_LIVERELOAD,
    LIVERELOAD_PORT: config.LIVERELOAD_PORT,
    BASE_PATH_URL: config.BASE_PATH_URL,
    BASE_PATH_ROUTE: config.BASE_PATH_ROUTE,
    FEEDBACK_ROUTE: config.FEEDBACK_ROUTE,
    FOOTER_THEME: config.FOOTER_THEME,
    FOOTER_TYPE: config.FOOTER_TYPE,
    FOOTER_PADDING_TOP : config.FOOTER_PADDING_TOP,
    FOOTER_HELP_LINK : config.FOOTER_HELP_LINK,
    KMT_CONFIG: '{}',
    errorDetails: JSON.stringify({
      messages: errorMessages,
      code: statusCode
    })
  };

  res.set({ 'Cache-Control': 'max-age=300, stale-while-revalidate=86400, stale-if-error=259200, public' });
  res.status(statusCode).render('index', data);
}

module.exports = {
  middleware: middleware,
  devMiddleware: middleware, // TODO: Remove this once all other apps are only using middleware
  onUncaughtException: onUncaughtException,
  renderView: renderView
};
