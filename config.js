'use strict'

var fs = require('fs')

module.exports = {
	// Capped collection size (in bytes)
	// Set as false to not use capped collection
	logSize: 1024 * 1024 * 1024,
	// Mongo connection uri
	mongoUri: 'mongodb://localhost:27017/logSink',
	// Socket options for tls.createServer and https.createServer
	// If set to an empty object `{}`, net.createServer and http.createServer are used
	// It is recommended to use secure connection. If you choose to use plain text (like http),
	// make sure no one can peek your network, because everything (including credentials) will
	// be sent in the clear!
	socket: {
		// DO NOT USE THE EXAMPLE KEY/CERT since they were made public, ok?
		key: fs.readFileSync('./keys/example-key.pem'),
		cert: fs.readFileSync('./keys/example-cert.pem')
	},
	// Port for the main API
	port: 8018,
	// Port for the simple HTTP API
	// Set as null to disable it
	httpPort: 8019
}