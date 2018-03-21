'use strict'

let mongoose = require('mongoose'),
	config = require('./config')

require('./models/Log')
require('./models/User')

module.exports.start = callback => {
	mongoose.connect(config.mongoUri)
	mongoose.connection.once('connected', callback)
}