var fs = require('fs');
var config = require('./lib/config');

var paths = [
  __dirname + '/lib/exceptions',
  __dirname + '/lib/facades',
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
