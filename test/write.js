/*globals describe, before, it, after*/
'use strict'

require('should')

var utils = require('./utils'),
	mongoose = require('../mongoose'),
	Log = mongoose.model('Log1')

describe('write API', function () {
	var peer
	before(function (done) {
		utils.connect(function (err, peer_) {
			peer = peer_
			done(err)
		})
	})

	var log = {
		date: new Date,
		name: 'name',
		level: 2,
		relevance: 1,
		time: 17,
		message: 'message',
		commit: new Buffer([3, 14, 15]),
		extra: {
			'my-extra': [92, 65]
		}
	}
	
	it('should accept the write message', function () {
		peer.send('log', log)
	})

	it('should return success for the write call', function (done) {
		peer.call('log', log, done)
	})

	it('should have inserted the logs', function (done) {
		Log.find().sort('-_id').limit(2).lean().select('-_id').exec(function (err, logs) {
			if (err) {
				return done(err)
			}
			logs.should.have.length(2)
			logs[0].should.be.eql(logs[1])
			logs[0].commit = logs[0].commit.buffer
			logs[0].should.be.eql({
				origin: 'test',
				date: log.date,
				name: log.name,
				level: log.level,
				time: log.time,
				message: log.message,
				commit: log.commit,
				extra: log.extra
			})
			done()
		})
	})

	after(function (done) {
		peer.once('close', done)
		peer.close()
	})
})