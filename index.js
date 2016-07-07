'use strict';

const fs = require('fs');
const config = require('./lib/config');

const paths = [
  __dirname + '/lib/middleware',
  __dirname + '/lib/services',
  __dirname + '/lib'
];

module.exports.initialise = function(confObject) {
  config.initialise(confObject);

  paths.forEach(function(path) {
    fs.readdirSync(path).forEach(function(file) {
        if (~file.indexOf('.js')) {
          module.exports[file.replace(/\.js/, '')] = require(path + '/' + file);
        }
    });
  });
};
