/**
 * @file Implement the meta api
 */
'use strict'

var logger = require('../logger')

/**
 * @param {Object} data
 * @param {Function} done
 * @this Peer
 */
module.exports.getPermissions = function (data, done) {
	logger.info('meta', {
		user: this.user.name
	})

	done(null, [this.user.name].concat(this.user.canRead))
}