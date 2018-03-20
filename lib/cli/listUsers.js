/**
 * @file List all users and permissions in the system
 */
'use strict'

let commander = require('commander'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	magenta = require('chalk').bold.magenta,
	red = require('chalk').bold.red

commander
	.command('list-users')
	.description('list all users and permissions in the system')
	.action(() => {
		// eslint-disable-next-line array-callback-return
		User.find((err, users) => {
			if (err) {
				console.log(red('Failed'), err)
				process.exit(1)
			}
			users.forEach(user => {
				let permissions = [user.name].concat(user.canRead).join(', '),
					lastLogin = user.lastLogin ? user.lastLogin.toISOString() : 'never'
				console.log('%s', magenta(user.name))
				console.log('\tLast login: %s', lastLogin)
				console.log('\tPermissions: %s', permissions)
			})
			process.exit(0)
		})
	})