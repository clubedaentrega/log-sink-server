/**
 * @file List all users and permissions in the system
 */
'use strict'

var commander = require('commander'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	magenta = require('chalk').bold.magenta,
	red = require('chalk').bold.red

commander
	.command('list-users')
	.description('list all users and permissions in the system')
	.action(function () {
		User.find(function (err, users) {
			if (err) {
				console.log(red('Failed'), err)
				process.exit(1)
			}
			users.forEach(function (user) {
				var permissions = [user.name].concat(user.canRead).join(', ')
				console.log('%s\n\tPermissions: %s', magenta(user.name), permissions)
			})
			process.exit(0)
		})
	})