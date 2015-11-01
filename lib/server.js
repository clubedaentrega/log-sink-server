'use strict'

var AC = require('asynconnection'),
	commander = require('commander'),
	http = require('http'),
	https = require('https'),
	config = require('../config'),
	broadcast = require('./broadcast'),
	cntxt = new AC(),
	server, wsServer, httpServer

console.log()
console.log(new Date)

if (commander.testMode) {
	console.log('!!! Test mode is enabled. Do not forget to turn this off after testing !!!')
}

require('./api')(cntxt)

// Main API, over TCP
if (config.port) {
	server = cntxt.createServer(config.socket, {
		required: true,
		handler: require('./auth')
	}, function (conn) {
		conn.on('error', function (err) {
			console.log('[Peer error]', err)
		})
		broadcast.emit('connection', conn)
	})
	server.listen(config.port, function () {
		console.log('Server listening on port ' + config.port)
	})
	server.on('error', function (err) {
		console.log('[Server error]', err)
	})
}

// Main API, over WS
if (config.wsPort) {
	wsServer = cntxt.createWSServer(config.socket, {
		required: true,
		handler: require('./auth')
	}, function (conn) {
		conn.on('error', function (err) {
			console.log('[Peer error]', err)
		})
		broadcast.emit('connection', conn)
	})
	wsServer.listen(config.wsPort, function () {
		console.log('WebSocket server listening on port ' + config.wsPort)
	})
	wsServer.on('error', function (err) {
		console.log('[WSServer error]', err)
	})
}

// Simple API, over HTTP
if (config.httpPort) {
	if (config.socket.pfx || config.socket.key || config.socket.cert) {
		httpServer = https.createServer(config.socket, require('./api/http'))
	} else {
		httpServer = http.createServer(require('./api/http'))
	}
	httpServer.listen(config.httpPort, function () {
		console.log('HTTP server listening on port ' + config.httpPort)
	})
	httpServer.on('error', function (err) {
		console.log('[HTTP server error]', err)
	})
}