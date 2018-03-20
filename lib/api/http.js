'use strict'

let app = require('express')(),
	authHandler = require('../auth'),
	write = require('./write'),
	validate = require('validate-fields')()

// Add util methods
app.use((req, res, next) => {
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
app.use((req, res, next) => {
	let parts = (req.get('Authorization') || '').split(' '),
		auth, pos, user, password
	if (parts[0].toLowerCase() !== 'basic' || !parts[1]) {
		return res.error('Invalid Authorization header')
	}

	auth = Buffer.from(parts[1], 'base64').toString()
	pos = auth.indexOf(':')
	if (pos === -1) {
		return res.error('Invalid Authorization header')
	}

	user = auth.substr(0, pos)
	password = auth.substr(pos + 1)
	authHandler.call(req, user, password, err => {
		next(err)
	})
})

// JSON paylod
app.use(require('body-parser').json())

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
	res.error(err)
})

// Write API
let writeSchema = validate.parse({
	date: Date,
	name: String,
	level: 'uint',
	relevance: 'uint',
	'time?': 'uint',
	'message?': String,
	'commit?': 'hex',
	'extra?': '*'
})
app.post('/log', (req, res) => {
	if (!req.is('json')) {
		return res.error('Invalid request body. Set Content-Type to application/json')
	}

	let valid = writeSchema.validate(req.body, {
		strict: true
	})
	if (!valid) {
		return res.error(writeSchema.lastError)
	}

	if (req.body.commit) {
		req.body.commit = Buffer.from(req.body.commit, 'hex')
	}

	write.callHandler.call(req, req.body, err => {
		if (err) {
			return res.error(err)
		}
		res.success()
	})
})

module.exports = app