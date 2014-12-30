/**
 * @file Set-up all log collections
 * There are three:
 * * Log0: low-relevance logs, capped
 * * Log1: normal logs, capped
 * * Log2: high-relevance logs
 * 
 * All them have the same schema:
 * * Required basic fields: origin, date, name, level
 * * Optional basic fields: time, message, commit
 * * Custom field: extra
 * * All basic fields are indexed
 */
'use strict'

var mongoose = require('mongoose'),
	config = require('../config')

function setModel(name, options) {
	options.versionKey = false
	var schema = new mongoose.Schema({
		origin: {
			type: String,
			required: true
		},
		date: {
			type: Date,
			required: true
		},
		name: {
			type: String,
			required: true,
			index: true
		},
		level: {
			type: Number,
			required: true,
			index: true
		},
		time: {
			type: Number,
			index: true,
			sparse: true
		},
		message: {
			type: String,
			index: true,
			sparse: true
		},
		commit: {
			type: Buffer,
			index: true,
			sparse: true
		},
		extra: mongoose.Schema.Types.Mixed
	}, options)

	schema.index({
		origin: 1,
		date: 1
	})

	mongoose.model(name, schema)
}

setModel('Log0', {
	capped: config.logSize
})
setModel('Log1', {
	capped: config.logSize
})
setModel('Log2', {})