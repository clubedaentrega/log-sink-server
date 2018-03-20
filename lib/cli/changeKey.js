/**
 * @file Generate another password for this user
 */
'use strict'

let commander = require('commander'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	crypto = require('crypto'),
	green = require('chalk').bold.green,
	red = require('chalk').bold.red

commander
	.command('change-key <user>')
	.description('generate another password for this user')
	.action(user => {
		// Pick a good key to the user
		let key = crypto.pseudoRandomBytes(32),
			hasher = crypto.createHash('sha256'),
			hash

		hasher.end(key)
		hash = hasher.read()

		User.update({
			name: user
		}, {
			key: hash
		}, (err, response) => {
			if (err || !response.n) {
				console.log(red('Failed change key'))
				console.log('Error: %s', err || 'User ' + user + ' not found')
				process.exit(1)
			}
			console.log(green('User updated'))
			console.log('New password: %s', key.toString('base64'))
			process.exit(0)
		})
	})