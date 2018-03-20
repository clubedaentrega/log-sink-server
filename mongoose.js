'use strict'

let mongoose = require('mongoose'),
	config = require('./config')

mongoose.connect(config.mongoUri)
require('./models/Log')
require('./models/User')

module.exports = mongoose