/**
 * @file Remove a user from the system
 */
'use strict'

let commander = require('commander'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	green = require('chalk').bold.green,
	red = require('chalk').bold.red

commander
	.command('remove-user <user>')
	.description('remove a user from the system (their log data will be kept)')
	.action(user => {
		User.remove({
			name: user
		}, (err, response) => {
			if (err || !response.result.n) {
				console.log(red('Failed remove user'))
				console.log('Error: %s', err || 'User ' + user + ' not found')
				process.exit(1)
			}
			console.log(green('User removed'))
			process.exit(0)
		})
	})