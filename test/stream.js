/* globals describe, before, it, after*/
'use strict'

let should = require('should'),
	utils = require('./utils')

describe('stream API', () => {
	let peer, peer2
	before(done => {
		utils.connect((err, peer_) => {
			should(err).be.null()
			peer = peer_
			utils.connect('test2', (err, peer_) => {
				should(err).be.null()
				peer2 = peer_
				done()
			})
		})
	})

	it('should verify permissions', done => {
		// test2 can't read from test
		peer2.call('setStream', {
			id: 'x',
			includeExtra: false,
			filter: {
				origin: 'test'
			}
		}, err => {
			err.message.should.be.equal('You do not have permission to read data from this origin')
			done()
		})
	})

	it('should create streams', done => {
		peer.call('setStream', {
			id: 'myself',
			includeExtra: false,
			filter: {
				origin: 'test'
			}
		}, err => {
			should(err).be.null()
			peer.call('setStream', {
				id: 'another',
				includeExtra: false,
				filter: {
					origin: 'test2'
				}
			}, err => {
				should(err).be.null()
				done()
			})
		})
	})

	it('should be able to shutdown streams', done => {
		peer.call('unsetStream', 'myself', (err, ok) => {
			should(err).be.null()
			ok.should.be.true()
			peer.call('unsetStream', 'myself', (err, ok) => {
				should(err).be.null()
				ok.should.be.false()
				done()
			})
		})
	})

	it('should stream logs', done => {
		let log = {
			date: new Date,
			name: 'name',
			level: 4,
			relevance: 0
		}
		peer.once('stream', data => {
			data.includeExtra.should.be.false()
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

	after(done => {
		peer.once('close', () => {
			peer2.once('close', done)
			peer2.close()
		})
		peer.close()
	})
})