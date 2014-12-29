/**
 * @file Revoke a permission from a user to read data from another one
 */
'use strict'

var commander = require('commander'),
	mongoose = require('mongoose'),
	User = mongoose.model('User')

commander
	.command('revoke-permission <user> <permission>')
	.description('revoke a permission from a user to read data from another one')
	.action(function (user, permission) {
		User.findOneAndUpdate({
			name: user
		}, {
			$pull: {
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