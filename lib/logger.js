'use strict';
var winston = require('winston');
var dateformat = require('dateformat');

var config = require('./config');
var logDir = config.get('LOG_DIR');
var systemCode = config.get('SYSTEM_CODE');

var transports = [
  //new winston.transports.File({
  //  level: 'info',
  //  filename: logDir + '/' + systemCode + '-app.log',
  //  handleExceptions: true,
  //  json: false,
  //  maxsize: 5242880, //5MB
  //  maxFiles: 5,
  //  colorize: false,
  //  timestamp: function() {
  //    var now = new Date();
  //    return dateformat(now, 'yyyy-mm-dd HH:MM:ss');
  //  },
  //  formatter: function(options) {
  //    return systemCode + ': ' + options.level.toUpperCase() + ' [' + options.timestamp() + '] ' + (//undefined !== options.message ? options.message : '') +
  //    (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '' );
  //  }
  //})
];

if (!config.get('NODE_ENV')) {
  transports.push(
    new winston.transports.Console({
      timestamp: true,
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true
    })
  );
}

winston.emitErrs = true;

var logger = new winston.Logger({
  transports: transports,
  exitOnError: true
});

//Sanitise passwords

logger.addFilter(function(msg, meta, level) {
  return msg.replace(/(password|loginPassword|sessionToken|FTSession)(\=|\:)\S*/g, 'xxx');
});

logger.addRewriter(function(level, msg, meta) {
  if (meta.password) {
   meta = JSON.parse(JSON.stringify(meta));
   meta.password = 'xxx';
  }

  return meta;
});

logger.addRewriter(function(level, msg, meta) {
  if (meta.sessionToken) {
    meta.sessionToken = 'xxx';
  }

  return meta;
});

logger.addRewriter(function(level, msg, meta) {
  if (meta.loginPassword) {
    meta.loginPassword = 'xxx';
  }

  return meta;
});

logger.addRewriter(function(level, msg, meta) {
  if (meta.FTSession) {
    meta.FTSession = 'xxx';
  }

  return meta;
});

module.exports = logger;
module.exports.stream = {
  write: function(message, encoding) {
    logger.info(message);
  }
};
