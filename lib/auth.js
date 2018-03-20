/**
 * @file Handle authentication
 * This saves the User db object in peer.user
 */
'use strict'

let mongoose = require('mongoose'),
	User = mongoose.model('User'),
	crypto = require('crypto'),
	logger = require('./logger'),
	commander = require('commander')

/**
 * @param {string} user
 * @param {string} password
 * @param {function(?Error)} done
 */
module.exports = function (user, password, done) {
	let doLog = logger('auth', {
			user
		}),
		peer = this,
		buffer

	// Enable the case for testing
	// This will emulate two users: test and test2
	// test has permission to read from test2
	if (commander.testMode && (user === 'test' || user === 'test2')) {
		peer.user = new User({
			name: user,
			canRead: user === 'test' ? ['test2'] : []
		})
		doLog.info('Test user')
		return done()
	}

	// Check password format (a 32-byte base64-encoded key)
	buffer = Buffer.from(password, 'base64')
	if (buffer.length !== 32) {
		doLog.warn('Invalid password format')
		return done(new Error('Invalid password format'))
	}

	// Get the key saved in the db
	// There is no need for bcrypt(), pbkdf() or similar functions here
	// because the user-key is not a common user password with low entropy.
	// Instead, user-key is a full entropy 256-bit key
	let hasher = crypto.createHash('sha256')
	hasher.end(buffer)
	let hash = hasher.read()

	User.findOneAndUpdate({
		name: user,
		key: hash
	}, {
		$set: {
			lastLogin: new Date
		}
	}, (err, dbUser) => {
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