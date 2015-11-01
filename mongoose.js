'use strict'

var mongoose = require('mongoose'),
	config = require('./getConfig')

mongoose.connect(config.mongoUri)
require('./models/Log')
require('./models/User')

module.exports = mongoose