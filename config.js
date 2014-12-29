'use strict'

var fs = require('fs')

module.exports = {
	// Capped collection size (in bytes)
	logSize: 1024 * 1024 * 1024,
	// Mongo connection uri
	mongoUri: 'mongodb://localhost:27017/logSink',
	// Socket options (will be passed to net.createServer or tls.createServer)
	socket: {
		// DO NOT USE THE EXAMPLE KEY/CERT since they were made public, ok?
		key: fs.readFileSync('./keys/example-key.pem'),
		cert: fs.readFileSync('./keys/example-cert.pem')
	},
	// Port to bind to
	port: 8018
}