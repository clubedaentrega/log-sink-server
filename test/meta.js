/* globals describe, before, it, after*/
'use strict'

let should = require('should'),
	utils = require('./utils')

describe('meta API', () => {
	let peer
	before(done => {
		utils.connect((err, peer_) => {
			should(err).be.null()
			peer = peer_
			done()
		})
	})

	it('should get permissions', done => {
		peer.call('getPermissions', (err, permissions) => {
			should(err).be.null()
			permissions.should.be.eql(['test', 'test2'])
			done()
		})
	})

	after(done => {
		peer.once('close', done)
		peer.close()
	})
})