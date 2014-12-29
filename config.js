'use strict'

module.exports = {
	// Capped collection size (in bytes)
	logSize: 1024 * 1024 * 1024,
	// Mongo connection uri
	mongoUri: 'mongodb://localhost:27017/logSink',
	// Socket options (will be passed to net.createServer or tls.createServer)
	socket: {
	},
	// Port to bind to
	port: 8018
}