/**
 * @file Handle authentication
 * This saves the User db object in peer.user
 */
'use strict'

var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	crypto = require('crypto'),
	logger = require('./logger')

/**
 * @param {string} user
 * @param {string} password
 * @param {function(?Error)} done
 */
module.exports = function (user, password, done) {
	var doLog = logger('auth', {
			user: user
		}),
		peer = this

	// Check password format (a 32-byte hex-encoded key)
	if (!/^[0-9a-f]{64}$/i.test(password)) {
		doLog.warn('Invalid password format')
		return done(new Error('Invalid password format'))
	}

	// Get the key saved in the db
	// There is no need for bcrypt(), pbkdf() or similar functions here
	// because the user-key is not a common user password with low entropy.
	// Instead, user-key is a full entropy 256-bit key
	var hasher = crypto.createHash('sha256')
	hasher.end(new Buffer(password, 'hex'))
	var hash = hasher.read()

	User.findOne({
		name: user,
		key: hash
	}, function (err, dbUser) {
		if (err) {
			doLog.error(err.message)
			return done(err)
		} else if (!dbUser) {
			doLog.warn('Failed')
			return done(new Error('Auth failed'))
		}

		// Save for future reference
		peer.user = dbUser
		doLog.info()
		done()
	})
}