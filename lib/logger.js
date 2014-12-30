/**
 * @file Log log-sink-server events (inception, yeah!)
 */
'use strict'

var mongoose = require('mongoose'),
	Log1 = mongoose.model('Log1'),
	broadcast = require('./broadcast')

/**
 * @param {string} name
 * @param {string} [message]
 * @param {Object} [extra]
 */
module.exports.info = function (name, message, extra) {
	if (typeof message === 'object') {
		extra = message
		message = undefined
	}
	log(name, message, extra, 1)
}

/**
 * @param {string} name
 * @param {string} [message]
 * @param {Object} [extra]
 */
module.exports.warn = function (name, message, extra) {
	if (typeof message === 'object') {
		extra = message
		message = undefined
	}
	log(name, message, extra, 2)
}

/**
 * @param {string} name
 * @param {string} [message]
 * @param {Object} [extra]
 */
module.exports.error = function (name, message, extra) {
	if (typeof message === 'object') {
		extra = message
		message = undefined
	}
	log(name, message, extra, 3)
}

function log(name, message, extra, level) {
	var data = {
		origin: 'log-sink',
		date: new Date,
		name: name,
		level: level,
		relevance: 1,
		message: message,
		extra: extra
	}
	Log1.create(data, function () {})
	broadcast.emit('log', data)
}