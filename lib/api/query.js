/**
 * @file Implement the query api
 */
'use strict'

var logger = require('../logger')

/**
 * @typedef {Object} RangeUint
 * @property {?number} min
 * @property {?number} max
 */

/**
 * @typedef {Object} RangeDate
 * @property {Date} min
 * @property {?Date} max
 */

/**
 * @param {Object} data
 * @param {boolean} data.includeExtra
 * @param {Object} data.query
 * @param {number} data.query.relevance
 * @param {string} data.query.origin
 * @param {RangeDate} data.query.date
 * @param {?string} data.query.name
 * @param {?RegExp} data.query.nameRegex
 * @param {?string} data.query.message
 * @param {?RegExp} data.query.messageRegex
 * @param {?RangeUint} data.query.level
 * @param {?RangeUint} data.query.time
 * @param {?Buffer} data.query.commit
 * @param {?*} data.query.extra
 * @param {number} data.limit
 * @param {?number} data.skip
 * @param {?string} data.sort
 * @param {Function} done
 * @this Peer
 */
module.exports.query = function (data, done) {
	var q = data.query,
		Log = logger.getModel(q.relevance),
		doLog = logger('query', {
			user: this.user.name,
			data: data
		}),
		query, limit, skip, sort, select

	// Checks
	if (!Log) {
		doLog.warn('Invalid relevance')
		return done(new Error('Invalid relevance value'))
	} else if (!this.user.hasPermission(q.origin)) {
		doLog.warn('Not allowed')
		return done(new Error('You do not have permission to read data from this origin'))
	}

	// Basic query (required fields)
	query = {
		origin: q.origin,
		date: {
			$gte: q.date.min
		}
	}

	// Additional fields
	if (q.date.max) {
		query.date.$lte = q.date.max
	}
	if (q.name !== undefined) {
		query.name = q.name
	} else if (q.nameRegex) {
		query.name = q.nameRegex
	}
	if (q.message !== undefined) {
		query.message = q.message
	} else if (q.messageRegex) {
		query.message = q.messageRegex
	}
	if (q.level && (q.level.min !== undefined || q.level.max !== undefined)) {
		query.level = {}
		if (q.level.min !== undefined) {
			query.level.$gte = q.level.min
		}
		if (q.level.max !== undefined) {
			query.level.$lte = q.level.max
		}
	}
	if (q.time && (q.time.min !== undefined || q.time.max !== undefined)) {
		query.time = {}
		if (q.time.min !== undefined) {
			query.time.$gte = q.time.min
		}
		if (q.time.max !== undefined) {
			query.time.$lte = q.time.max
		}
	}
	if (q.commit) {
		query.commit = q.commit
	}
	if (q.extra) {
		query.extra = q.extra
	}

	// Execute query
	limit = data.limit
	skip = data.skip || 0
	sort = data.sort || 'date'
	select = data.includeExtra ? '' : '-extra'
	Log.find(query, select).limit(limit).skip(skip).sort(sort).lean().exec(function (err, logs) {
		if (err) {
			doLog.error(err.message)
			return done(err)
		}

		done(null, logs.map(function (log) {
			// Add relevance field, since it is not saved with the log
			log.relevance = q.relevance

			// Convert commit from Binary to Buffer
			if (log.commit) {
				log.commit = log.commit.buffer
			}
			return log
		}))
	})
}