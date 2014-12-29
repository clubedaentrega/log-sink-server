/**
 * @file Add a new user to the system
 */
'use strict'

require('./index')

var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	crypto = require('crypto'),
	key = crypto.pseudoRandomBytes(32),
	hasher = crypto.createHash('sha256'),
	user = process.argv[2],
	hash

if (!user) {
	console.log('Usage: node addUser <username>')
	process.exit(1)
}

hasher.end(key)
hash = hasher.read()

User.create({
	name: user,
	key: hash
}, function (err) {
	if (err) {
		throw err
	}
	console.log('User %s created with password %s', user, key.toString('hex'))
	process.exit(0)
})