/**
 * @file Add permission for a user to read data from another one
 */
'use strict'

let commander = require('commander'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	green = require('chalk').bold.green,
	red = require('chalk').bold.red

commander
	.command('add-permission <user> <permission>')
	.description('add permission for a user to read data from another one')
	.action((user, permission) => {
		User.findOneAndUpdate({
			name: user
		}, {
			$addToSet: {
				canRead: permission
			}
		}, {
			new: true
		}, (err, dbUser) => {
			if (err || !dbUser) {
				console.log(red('Failed to add permission'))
				console.log('Error: %s', err || 'User ' + user + ' not found')
				process.exit(1)
			}
			let permissions = [user].concat(dbUser.canRead).join(', ')
			console.log(green('User updated'))
			console.log('User: %s\nPermissions: %s', user, permissions)
			process.exit(0)
		})
	})