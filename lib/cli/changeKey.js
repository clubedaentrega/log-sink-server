/**
 * @file Generate another password for this user
 */
'use strict'

var commander = require('commander'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	crypto = require('crypto')

commander
	.command('change-key <user>')
	.description('generate another password for this user')
	.action(function (user) {
		// Pick a good key to the user
		var key = crypto.pseudoRandomBytes(32),
		hasher = crypto.createHash('sha256'),
		hash

		hasher.end(key)
		hash = hasher.read()

		User.update({
			name: user
		}, {
			key: hash
		}, function (err, ok) {
			if (err) {
				throw err
			} else if (!ok) {
				throw new Error('User ' + user + ' not found')
			}
			console.log('User updated\nNew password: %s', key.toString('base64'))
			process.exit(0)
		})
	})