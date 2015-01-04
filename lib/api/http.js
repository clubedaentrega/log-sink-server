'use strict'

var app = require('express')(),
	authHandler = require('../auth'),
	write = require('./write'),
	validate = require('validate-fields')

// Add util methods
app.use(function (req, res, next) {
	res.error = function (errOrStr) {
		res.json({
			ok: false,
			error: String(errOrStr.message || errOrStr)
		})
	}
	res.success = function () {
		res.json({
			ok: true
		})
	}
	next()
})

// Auth handler
app.use(function (req, res, next) {
	var parts = (req.get('Authorization') || '').split(' '),
		auth, pos, user, password
	if (parts[0].toLowerCase() !== 'basic' || !parts[1]) {
		return res.error('Invalid Authorization header')
	}

	auth = new Buffer(parts[1], 'base64').toString()
	pos = auth.indexOf(':')
	if (pos === -1) {
		return res.error('Invalid Authorization header')
	}

	user = auth.substr(0, pos)
	password = auth.substr(pos + 1)
	authHandler.call(req, user, password, function (err) {
		next(err)
	})
})

// JSON paylod
app.use(require('body-parser').json())

// Error handler
app.use(function (err, req, res, next) {
	res.error(err)
	next // not called, it's just to keep jshint relaxed
})

// Write API
var writeSchema = validate.parse({
	date: Date,
	name: String,
	level: 'uint',
	relevance: 'uint',
	'time?': 'uint',
	'message?': String,
	'commit?': 'hex',
	'extra?': '*'
})
app.post('/log', function (req, res) {
	if (!req.is('json')) {
		return res.error('Invalid request body. Set Content-Type to application/json')
	}

	var valid = writeSchema.validate(req.body, {
		strict: true
	})
	if (!valid) {
		return res.error(writeSchema.lastError)
	}

	if (req.body.commit) {
		req.body.commit = new Buffer(req.body.commit, 'hex')
	}

	write.callHandler.call(req, req.body, function (err) {
		if (err) {
			return res.error(err)
		}
		res.success()
	})
})

module.exports = app