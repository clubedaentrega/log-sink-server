'use strict'

var commander = require('commander')

module.exports = commander.testMode ? require('./example-config') : require('./config')