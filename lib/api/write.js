/**
 * @file Implement the write api
 */
'use strict'

var mongoose = require('mongoose'),
	Log0 = mongoose.model('Log0'),
	Log1 = mongoose.model('Log1'),
	Log2 = mongoose.model('Log2')

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
	var Log
	if (data.relevance === 0) {
		Log = Log0
	} else if (data.relevance === 1) {
		Log = Log1
	} else if (data.relevance === 2) {
		Log = Log2
	} else {
		return done(new Error('Invalid relevance value'))
	}

	data.origin = this.user.name
	Log.create(data, done)
}

module.exports.messageHandler = function (data) {
	module.exports.callHandler.call(this, data, function () {})
}