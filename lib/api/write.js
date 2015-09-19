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
 * @param {?Function} done
 * @this {Peer}
 */
module.exports.callHandler = function (data, done) {
	var Log = logger.getModel(data.relevance)
	if (!Log) {
		return done(new Error('Invalid relevance value'))
	}

	data.origin = this.user.name
	fixFields(data.extra)
	var logDoc = new Log(data)
	broadcast.emit('log', data)

	if (done) {
		logDoc.save(done)
	} else {
		// Fire and forget
		logDoc.save({
			w: 0
		})
	}
}

module.exports.messageHandler = function (data) {
	module.exports.callHandler.call(this, data)
}

/**
 * Rename fields with invalid names due to mongodb restrictions
 * Any '$' is replaced by '＄' (\uff04)
 * Any '.' is replaced by '．' (\uff0e)
 * Any \0 is removed
 * @param {*} x
 */
function fixFields(x) {
	var keys, i, len, key, newKey
	if (Array.isArray(x)) {
		x.map(fixFields)
	} else if (x && typeof x === 'object') {
		keys = Object.keys(x)
		for (i = 0, len = keys.length; i < len; i++) {
			key = keys[i]
			fixFields(x[key])
			if (/[$.\0]/.test(key)) {
				newKey = key.replace(/\$/g, '\uff04').replace(/\./g, '\uff0e').replace(/\0/g, '')
				x[newKey] = x[key]
				delete x[key]
			}
		}
	}
}