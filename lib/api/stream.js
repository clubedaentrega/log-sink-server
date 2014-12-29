/**
 * @file Implement the stream api
 * This sets the property 'streams' in peer
 */
'use strict'

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
 * @param {Stream} data - with data.peer unset
 * @param {Function} done
 * @this {Peer}
 */
module.exports.set = function (data, done) {
	data.peer = this

	// Check permission
	if (!this.user.hasPermission(data.filter.origin)) {
		return done(new Error('You do not have permission to read data from this origin'))
	}

	if (this.streams[data.id]) {
		return done(new Error('You have already set a log stream with this id. ' +
			'To use change it, first unset it'))
	}

	this.streams[data.id] = data
	if (!streams[data.filter.origin]) {
		streams[data.filter.origin] = []
	}
	streams[data.filter.origin].push(data)
	return done(null, false)
}

/**
 * @param {Object} data
 * @param {string} data.id
 * @param {Function} done
 * @this {Peer}
 */
module.exports.unset = function (data, done) {
	var stream = this.streams[data.id],
		arr, i
	if (!stream) {
		// No-op
		return done(null, false)
	}

	delete this.streams[data.id]
	arr = streams[stream.filter.origin]
	for (i = 0; i < arr.length; i++) {
		if (arr[i].peer === this && arr[i].id === data.id) {
			arr.splice(i, 1)
			return done(null, true)
		}
	}

	// This point should never be reached
	throw new Error('Invalid internal streams state')
}

/**
 * @param {Object} data
 * @param {Function} done
 * @this {Peer}
 */
module.exports.unsetAll = function (data, done) {
	unsetAll(this)
	done()
}

/**
 * @param {Peer} peer
 */
module.exports.onconnection = function (peer) {
	/**
	 * Map from stream id to stream data
	 * @member {Object<Stream>} Peer#streams
	 */
	peer.streams = Object.create(null)

	peer.once('close', function () {
		unsetAll(peer)
	})
}

/**
 * @param {Peer} peer
 */
function unsetAll(peer) {
	var id, arr, i, stream
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