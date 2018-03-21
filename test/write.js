/* globals describe, before, it, after*/
'use strict'

let should = require('should'),
	utils = require('./utils'),
	mongoose = require('mongoose'),
	Log = mongoose.model('Log1'),
	request = require('request'),
	config = require('../config')

describe('write API', () => {
	let peer
	before(done => {
		utils.connect((err, peer_) => {
			peer = peer_
			done(err)
		})
	})

	let log = {
		date: new Date,
		name: 'name',
		level: 2,
		relevance: 1,
		time: 17,
		message: 'message',
		commit: Buffer.from([3, 14, 15]),
		extra: {
			'my-extra': [92, 65]
		}
	}
	log.commit.toJSON = function () {
		return this.toString('hex')
	}

	it('should accept the write message', () => {
		peer.send('log', log)
	})

	it('should return success for the write call', done => {
		peer.call('log', log, done)
	})

	it('should accept logs by http', done => {
		request({
			url: 'https://localhost:' + config.httpPort + '/log',
			json: log,
			method: 'POST',
			ca: config.socket.cert,
			auth: {
				user: 'test',
				pass: '',
				sendImmediately: true
			}
		}, (err, _, result) => {
			should(err).be.null()
			result.should.be.eql({
				ok: true
			})
			done()
		})
	})

	it('should have inserted the logs', done => {
		Log.find({
			origin: 'test'
		}).sort('-_id').limit(3).lean().select('-_id').exec((err, logs) => {
			should(err).be.null()
			logs.should.have.length(3)
			logs[0].should.be.eql(logs[1])
			logs[0].should.be.eql(logs[2])
			logs[0].commit = logs[0].commit.buffer
			logs[0].should.be.eql({
				origin: 'test',
				date: log.date,
				name: log.name,
				level: log.level,
				time: log.time,
				message: log.message,
				commit: Buffer.from(log.commit),
				extra: log.extra
			})
			done()
		})
	})

	after(done => {
		peer.once('close', done)
		peer.close()
	})
})