'use strict'

var AC = require('asynconnection-node'),
	mongoose = require('mongoose'),
	config = require('./config'),
	cntxt = new AC()

// Set up mongoose
mongoose.connect(config.mongoUri)
require('./models/Log')
require('./models/User')

// Set up asynconnection server
require('./lib/api')(cntxt)
cntxt.createServer(config.socket, {
	required: true,
	handler: require('./lib/auth')
}, function (conn) {
	conn.on('error', function (err) {
		console.log('[Peer error]', err)
	})
	require('./lib/api/stream').onconnection(conn)
}).listen(config.port, function () {
	console.log('Server listening on port ' + config.port)
}).on('error', function (err) {
	console.log('[Server error]', err)
})