/**
 * @file Implement the stream api
 * This sets the property 'streams' in peer
 */
'use strict'

var broadcast = require('../broadcast'),
	logger = require('../logger')

/**
 * Stream mapped by log origin
 * @member {Object<Array<Stream>>}
 */
var streams = Object.create(null)

/**
 * @typedef {Object} Range
 * @property {?number} min
 * @property {?number} max
 */

/**
 * @typedef {Object} Filter
 * @param {string} origin
 * @param {?string} name
 * @param {?RegExp} nameRegex
 * @param {?Range} level
 * @param {?Range} relevance
 * @param {?Range} time
 * @param {?string} message
 * @param {?RegExp} messageRegex
 * @param {?Buffer} commit
 */

/**
 * @typedef {Object} Stream
 * @param {string} id
 * @param {boolean} includeExtra
 * @param {Filter} filter
 * @param {Peer} peer
 */

/**
 * @param {Object} data
 * @param {string} data.id
 * @param {boolean} data.includeExtra
 * @param {Filter} data.filter
 * @param {Function} done
 * @this {Peer}
 */
module.exports.set = function (data, done) {
	var doLog = logger('stream/set', {
		user: this.user.name,
		data: data
	})

	// Check permission
	if (!this.user.hasPermission(data.filter.origin)) {
		doLog.warn('Not allowed')
		return done(new Error('You do not have permission to read data from this origin'))
	}

	if (this.streams[data.id]) {
		doLog.warn('Already set')
		return done(new Error('You have already set a log stream with this id. ' +
			'To use change it, first unset it'))
	}

	doLog.info()
	var stream = {
		id: data.id,
		includeExtra: data.includeExtra,
		filter: data.filter,
		peer: this
	}
	this.streams[data.id] = stream
	if (!streams[data.filter.origin]) {
		streams[data.filter.origin] = []
	}
	streams[data.filter.origin].push(stream)
	return done(null, false)
}

/**
 * @param {string} id
 * @param {Function} done
 * @this {Peer}
 */
module.exports.unset = function (id, done) {
	logger.info('stream/unset', {
		user: this.user.name,
		id: id
	})
	var stream = this.streams[id],
		arr, i
	if (!stream) {
		// No-op
		return done(null, false)
	}

	delete this.streams[id]
	arr = streams[stream.filter.origin]
	for (i = 0; i < arr.length; i++) {
		if (arr[i].peer === this && arr[i].id === id) {
			arr.splice(i, 1)
			return done(null, true)
		}
	}

	// This point should never be reached
	throw new Error('Invalid internal streams state')
}

/**
 * @param {*} _
 * @param {Function} done
 * @this {Peer}
 */
module.exports.unsetAll = function (_, done) {
	unsetAll(this)
	done()
}

broadcast.on('connection', function (peer) {
	/**
	 * Map from stream id to stream data
	 * @member {Object<Stream>} Peer#streams
	 */
	peer.streams = Object.create(null)

	peer.once('close', function () {
		unsetAll(peer)
	})
})

broadcast.on('log', function (log) {
	var arr = streams[log.origin],
		i, len, stream
	if (!arr || !arr.length) {
		// No listeners
		return
	}

	var logWithoutExtra = {
		origin: log.origin,
		date: log.date,
		name: log.name,
		level: log.level,
		relevance: log.relevance,
		time: log.time,
		message: log.message,
		commit: log.commit
	}

	for (i = 0, len = arr.length; i < len; i++) {
		stream = arr[i]
		if (matchFilter(stream.filter, log)) {
			// TODO: back pressure?
			stream.peer.send('stream', {
				id: stream.id,
				includeExtra: stream.includeExtra,
				log: stream.includeExtra ? log : logWithoutExtra
			})
		}
	}
})

/**
 * @param {Peer} peer
 */
function unsetAll(peer) {
	var id, arr, i, stream
	logger.info('stream/unsetAll', {
		user: peer.user.name
	})
	for (id in peer.streams) {
		stream = peer.streams[id]
		arr = streams[stream.filter.origin]
		for (i = 0; i < arr.length; i++) {
			if (arr[i].peer === peer && arr[i].id === id) {
				arr.splice(i, 1)
				break
			}
		}
	}
	peer.streams = Object.create(null)
}

/**
 * @param {Filter} filter
 * @param {Object} log
 * @return {boolean}
 */
function matchFilter(filter, log) {
	var i, len

	if (filter.commit) {
		if (!log.commit || filter.commit.length !== log.commit.length) {
			return false
		}

		for (i = 0, len = log.commit.length; i < len; i++) {
			if (filter.commit[i] !== log.commit[i]) {
				return false
			}
		}
	}

	if (filter.name !== undefined) {
		if (log.name !== filter.name) {
			return false
		}
	} else if (filter.nameRegex !== undefined) {
		if (!filter.nameRegex.test(log.name)) {
			return false
		}
	}

	if (filter.message !== undefined) {
		if (log.message !== filter.message) {
			return false
		}
	} else if (filter.messageRegex !== undefined) {
		if (log.message === undefined || !filter.messageRegex.test(log.message)) {
			return false
		}
	}

	if (filter.level) {
		if ((filter.level.min !== undefined && log.level < filter.level.min) ||
			(filter.level.max !== undefined && log.level > filter.level.max)) {
			return false
		}
	}

	if (filter.relevance) {
		if ((filter.relevance.min !== undefined && log.relevance < filter.relevance.min) ||
			(filter.relevance.max !== undefined && log.relevance > filter.relevance.max)) {
			return false
		}
	}

	if (filter.time) {
		if ((filter.time.min !== undefined &&
				(log.time === undefined || log.time < filter.time.min)) ||
			(filter.time.max !== undefined &&
				(log.time === undefined || log.time > filter.time.max))) {
			return false
		}
	}

	return true
}