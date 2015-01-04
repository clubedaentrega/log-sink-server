/**
 * @file Add a new user to the system
 */
'use strict'

var commander = require('commander'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	crypto = require('crypto')

commander
	.command('add-user <user>')
	.description('add a new user to the system')
	.action(function (user) {
		// Pick a good key to the user
		var key = crypto.pseudoRandomBytes(32),
		hasher = crypto.createHash('sha256'),
		hash

		hasher.end(key)
		hash = hasher.read()

		User.create({
			name: user,
			key: hash
		}, function (err) {
			if (err) {
				throw err
			}
			console.log('User created\nName: %s\nPassword: %s', user, key.toString('base64'))
			process.exit(0)
		})
	})