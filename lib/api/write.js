/**
 * @file Implement the write api
 */
'use strict'

var broadcast = require('../broadcast'),
	logger = require('../logger')

/**
 * @param {Object} data
 * @param {Date} data.date
 * @param {string} data.name
 * @param {number} data.level
 * @param {number} data.relevance
 * @param {?number} data.time
 * @param {?string} data.message
 * @param {?Buffer} data.commit
 * @param {?*} data.extra
 * @param {Function} done
 * @this {Peer}
 */
module.exports.callHandler = function (data, done) {
	var Log = logger.getModel(data.relevance)
	if (!Log) {
		return done(new Error('Invalid relevance value'))
	}

	data.origin = this.user.name
	// TODO: fix extra field names with '.' and '$'
	Log.create(data, done)
	broadcast.emit('log', data)
}

module.exports.messageHandler = function (data) {
	module.exports.callHandler.call(this, data, function () {})
}