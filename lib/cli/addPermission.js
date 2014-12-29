/**
 * @file Add permission for a user to read data from another one
 */
'use strict'

var commander = require('commander'),
	mongoose = require('mongoose'),
	User = mongoose.model('User')

commander
	.command('add-permission <user> <permission>')
	.description('add permission for a user to read data from another one')
	.action(function (user, permission) {
		User.findOneAndUpdate({
			name: user
		}, {
			$addToSet: {
				canRead: permission
			}
		}, function (err, dbUser) {
			if (err) {
				throw err
			} else if (!dbUser) {
				throw new Error('User ' + user + ' not found')
			}
			var permissions = [user].concat(dbUser.canRead).join(', ')
			console.log('User updated\nUser: %s\nPermissions: %s', user, permissions)
			process.exit(0)
		})
	})