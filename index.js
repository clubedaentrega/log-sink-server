'use strict'

var AC = require('asynconnection-node'),
	mongoose = require('mongoose'),
	commander = require('commander'),
	fs = require('fs'),
	http = require('http'),
	https = require('https'),
	config = require('./config'),
	broadcast = require('./lib/broadcast'),
	cntxt = new AC(),
	command, server, httpServer

// Set up mongoose
mongoose.connect(config.mongoUri)
require('./models/Log')
require('./models/User')

// Log ourselves
require('./lib/logger').info('run', process.argv.slice(2))

// Set up program CLI
fs.readdirSync('./lib/cli').forEach(function (file) {
	if (/\.js$/.test(file)) {
		require('./lib/cli/' + file)
	}
})
commander.on('*', function () {
	throw new Error('Command not found')
})
command = commander.parse(process.argv).args[0]

if (!command) {
	// Set up asynconnection server
	// (but only if we're not executing any subcommand)
	console.log()
	console.log(new Date)

	require('./lib/api')(cntxt)
	server = cntxt.createServer(config.socket, {
		required: true,
		handler: require('./lib/auth')
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

	if (config.httpPort) {
		if (config.socket.pfx || config.socket.key || config.socket.cert) {
			httpServer = https.createServer(config.socket, require('./lib/api/http'))
		} else {
			httpServer = http.createServer(require('./lib/api/http'))
		}
		httpServer.listen(config.httpPort, function () {
			console.log('HTTP server listening on port ' + config.httpPort)
		})
		httpServer.on('error', function (err) {
			console.log('[HTTP server error]', err)
		})
	}
}