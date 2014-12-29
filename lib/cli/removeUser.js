/**
 * @file Remove a user from the system
 */
'use strict'

var commander = require('commander'),
	mongoose = require('mongoose'),
	User = mongoose.model('User')

commander
	.command('remove-user <user>')
	.description('remove a user from the system (their log data will be kept)')
	.action(function (user) {
		User.remove({
			name: user
		}, function (err, ok) {
			if (err) {
				throw err
			} else if (!ok) {
				throw new Error('User ' + user + ' not found')
			}
			console.log('User removed')
			process.exit(0)
		})
	})