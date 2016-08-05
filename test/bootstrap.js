var mocha = require('mocha');
var coMocha = require('co-mocha');
var config = require('../lib/config');
var dummyConfig = require('./config.json');

coMocha(mocha);
console.dir('dummy config: '+ JSON.stringify(dummyConfig));
config.initialise(dummyConfig);
