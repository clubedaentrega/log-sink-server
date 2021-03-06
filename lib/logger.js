/**
 * @file Log log-sink-server events (inception, yeah!)
 */
'use strict'

let mongoose = require('mongoose'),
	Log0 = mongoose.model('Log0'),
	Log1 = mongoose.model('Log1'),
	Log2 = mongoose.model('Log2'),
	broadcast = require('./broadcast')

/**
 * Bind the name and extra parameters to get an object with 3 methods (info, warn, error)
 * Each of those methods receives only 1 optional argument (message)
 * @param {string} name
 * @param {Object} [extra]
 * @return {Object<Function>}
 */
module.exports = function (name, extra) {
	return {
		info (message) {
			log(name, message, extra, 1)
		},
		warn (message) {
			log(name, message, extra, 2)
		},
		error (message) {
			log(name, message, extra, 3)
		}
	}
}

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

/**
 * @param {number} relevance - 0, 1 or 2
 * @returns {?Model} - undefined if the relevance is invalid
 */
module.exports.getModel = function (relevance) {
	if (relevance === 0) {
		return Log0
	} else if (relevance === 1) {
		return Log1
	} else if (relevance === 2) {
		return Log2
	}
}

function log(name, message, extra, level) {
	let data = {
		origin: 'log-sink',
		date: new Date,
		name,
		level,
		relevance: 1,
		message,
		extra
	}
	let logDoc = new Log0(data)
	logDoc.save({
		w: 0
	})
	broadcast.emit('log', data)
}