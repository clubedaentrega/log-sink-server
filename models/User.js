/**
 * @file Set-up users collection
 */
'use strict'

var mongoose = require('mongoose')

var schema = new mongoose.Schema({
	// Application name (saved as Log origin field)
	name: {
		type: String,
		index: true
	},
	// hex(sha256(user-key))
	// There is no need for bcrypt(), pbkdf() or similar functions here
	// because the user-key is not a common user password with low entropy.
	// Instead, user-key is a full entropy 256-bit key
	key: Buffer,
	// Other app's log this one can read
	canRead: [String]
})

/**
 * Return whether the user has read privilege on the given origin
 * @param {string} origin
 * @return {boolean}
 */
schema.method('hasPermission', function (origin) {
	return origin === this.name || this.canRead.indexOf(origin) !== -1
})

mongoose.model('User', schema)