var mocha = require('mocha');
var coMocha = require('co-mocha');
var config = require('../lib/config');
var dummyConfig = require('./config.json');

coMocha(mocha);
config.initialise(dummyConfig);
