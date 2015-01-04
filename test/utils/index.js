'use strict'

var config = require('../../config'),
	AC = require('asynconnection-node')

var range = {
	'min?': 'uint',
	'max?': 'uint'
}

var log = {
	origin: 'string',
	date: 'date',
	name: 'string',
	level: 'uint',
	relevance: 'uint',
	'time?': 'uint',
	'message?': 'string',
	'commit?': 'Buffer',
	'extra?': 'json'
}

var options = {
	secure: Boolean(config.socket.cert),
	ca: config.socket.cert,
	port: config.port
}

module.exports.connect = function (done) {
	var cntxt = new AC()

	// Write api
	var writeLog = {
		date: 'date',
		name: 'string',
		level: 'uint',
		relevance: 'uint',
		'time?': 'uint',
		'message?': 'string',
		'commit?': 'Buffer',
		'extra?': 'json'
	}
	cntxt.addClientMessage(1, 'log', writeLog)
	cntxt.addClientCall(1, 'log', writeLog, null)

	// Live stream api
	cntxt.addClientCall(2, 'setStream', {
		id: 'string',
		includeExtra: 'boolean',
		filter: {
			origin: 'string',
			'name?': 'string',
			'nameRegex?': 'regex',
			'level?': range,
			'relevance?': range,
			'time?': range,
			'message?': 'string',
			'messageRegex?': 'regex',
			'commit?': 'Buffer'
		}
	}, null)
	cntxt.addClientCall(3, 'unsetStream', 'string', 'boolean')
	cntxt.addClientCall(4, 'unsetAllStreams', null, null)
	cntxt.addServerMessage(1, 'stream', {
		id: 'string',
		includeExtra: 'boolean',
		log: log
	})

	// Query api
	cntxt.addClientCall(5, 'query', {
		includeExtra: 'boolean',
		query: {
			origin: 'string',
			date: {
				min: 'date',
				'max?': 'date'
			},
			relevance: 'uint',
			'name?': 'string',
			'nameRegex?': 'regex',
			'level?': range,
			'time?': range,
			'message?': 'string',
			'messageRegex?': 'regex',
			'commit?': 'Buffer',
			'extra?': 'json'
		},
		limit: 'uint',
		'skip?': 'uint',
		'sort?': 'string'
	}, [log])
	
	// Connect and translate to done(err, peer)
	var onerror = function (err) {
		done(err)
	}
	var peer = cntxt.connect(options, {
		user: 'test',
		password: ''
	}, function () {
		peer.removeListener('error', onerror)
		done(null, peer)
	})
	peer.once('error', onerror)
}