/*globals describe, before, it, after*/
'use strict'

var should = require('should'),
	utils = require('./utils')

describe('write API', function () {
	var peer, peer2
	before(function (done) {
		utils.connect(function (err, peer_) {
			should(err).be.null
			peer = peer_
			utils.connect('test2', function (err, peer_) {
				should(err).be.null
				peer2 = peer_
				done()
			})
		})
	})

	it('should verify permissions', function (done) {
		// test2 can't read from test
		peer2.call('setStream', {
			id: 'x',
			includeExtra: false,
			filter: {
				origin: 'test'
			}
		}, function (err) {
			err.message.should.be.equal('You do not have permission to read data from this origin')
			done()
		})
	})

	it('should create streams', function (done) {
		peer.call('setStream', {
			id: 'myself',
			includeExtra: false,
			filter: {
				origin: 'test'
			}
		}, function (err) {
			should(err).be.null
			peer.call('setStream', {
				id: 'another',
				includeExtra: false,
				filter: {
					origin: 'test2'
				}
			}, function (err) {
				should(err).be.null
				done()
			})
		})
	})

	it('should be able to shutdown streams', function (done) {
		peer.call('unsetStream', 'myself', function (err, ok) {
			should(err).be.null
			ok.should.be.true
			peer.call('unsetStream', 'myself', function (err, ok) {
				should(err).be.null
				ok.should.be.false
				done()
			})
		})
	})

	it('should stream logs', function (done) {
		var log = {
			date: new Date,
			name: 'name',
			level: 4,
			relevance: 0
		}
		peer.once('stream', function (data) {
			data.includeExtra.should.be.false
			data.id.should.be.equal('another')
			data.log.should.be.eql({
				commit: undefined,
				date: log.date,
				extra: undefined,
				level: 4,
				message: undefined,
				name: 'name',
				origin: 'test2',
				relevance: 0,
				time: undefined
			})
			done()
		})
		peer2.send('log', log)
	})

	after(function (done) {
		peer.once('close', function () {
			peer2.once('close', done)
			peer2.close()
		})
		peer.close()
	})
})