/*globals describe, before, it, after*/
'use strict'

var should = require('should'),
	utils = require('./utils')

describe('meta API', function () {
	var peer
	before(function (done) {
		utils.connect(function (err, peer_) {
			should(err).be.null()
			peer = peer_
			done()
		})
	})

	it('should get permissions', function (done) {
		peer.call('getPermissions', function (err, permissions) {
			should(err).be.null()
			permissions.should.be.eql(['test', 'test2'])
			done()
		})
	})

	after(function (done) {
		peer.once('close', done)
		peer.close()
	})
})