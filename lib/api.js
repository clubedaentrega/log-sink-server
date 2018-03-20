/**
 * @file Set-up api in asynconnection
 */
'use strict'

let write = require('./api/write'),
	stream = require('./api/stream'),
	query = require('./api/query'),
	meta = require('./api/meta')

let range = {
	'min?': 'uint',
	'max?': 'uint'
}

let log = {
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

module.exports = function (cntxt) {
	// Write api
	let writeLog = {
		date: 'date',
		name: 'string',
		level: 'uint',
		relevance: 'uint',
		'time?': 'uint',
		'message?': 'string',
		'commit?': 'Buffer',
		'extra?': 'json'
	}
	cntxt.addClientMessage(1, 'log', writeLog, write.messageHandler)
	cntxt.addClientCall(1, 'log', writeLog, null, write.callHandler)

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
	}, null, stream.set)
	cntxt.addClientCall(3, 'unsetStream', 'string', 'boolean', stream.unset)
	cntxt.addClientCall(4, 'unsetAllStreams', null, null, stream.unsetAll)
	cntxt.addServerMessage(1, 'stream', {
		id: 'string',
		includeExtra: 'boolean',
		log
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
	}, [log], query.query)

	// Meta api
	cntxt.addClientCall(6, 'getPermissions', null, ['string'], meta.getPermissions)
}