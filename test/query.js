/* globals describe, before, it, after*/
'use strict'

let should = require('should'),
	utils = require('./utils')

describe('query API', () => {
	let log = {
			origin: 'test',
			date: new Date,
			name: 'name',
			level: 1,
			relevance: 1,
			message: 'Hello World',
			commit: Buffer.from([3, 14, 15, 92, 65, 35]),
			time: 17,
			extra: {
				file: 'query.js',
				test: true
			}
		},
		peer

	before(done => {
		utils.connect((err, peer_) => {
			should(err).be.null()
			peer = peer_
			peer.call('log', log, done)
		})
	})

	it('should check for permission', done => {
		peer.call('query', {
			includeExtra: false,
			query: {
				origin: 'will-fail',
				date: {
					min: new Date
				},
				relevance: 1
			},
			limit: 1
		}, err => {
			err.message.should.be.equal('You do not have permission to read data from this origin')
			done()
		})
	})

	it('should run the given query', done => {
		peer.call('query', {
			includeExtra: true,
			query: {
				origin: 'test',
				date: {
					min: log.date
				},
				relevance: 1
			},
			limit: 1
		}, (err, logs) => {
			should(err).be.null()
			logs.should.have.length(1)
			logs[0].should.be.eql(log)
			done()
		})
	})

	after(done => {
		peer.once('close', done)
		peer.close()
	})
})