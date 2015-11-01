/**
 * @file Report internal statistics about log sink server
 */
'use strict'

var broadcast = require('./broadcast'),
	logger = require('./logger'),
	config = require('../getConfig'),
	statsByOrigin = Object.create(null),
	reportInterval = config.reportInterval === undefined ? 3600e3 : config.reportInterval

if (!reportInterval) {
	// Reporting is disabled
	return
}

broadcast.on('log', function (log) {
	// Update stats about writing data
	var stats = getStats(log.origin)
	stats.write.bytes += JSON.stringify(log).length
	stats.write.logs += 1
})

// Report aggregated data at a fixed interval
setInterval(function () {
	var oldStatsByOrigin = statsByOrigin
	statsByOrigin = Object.create(null)

	Object.keys(oldStatsByOrigin).forEach(function (origin) {
		var extra = oldStatsByOrigin[origin]
		extra.write.avgSize = extra.write.bytes / extra.write.logs
		extra.write['kiB/s'] = 1e3 * extra.write.bytes / extra.interval / 1024
		extra.write['log/s'] = 1e3 * extra.write.logs / extra.interval
		logger.info('writeVolume', extra)
	})
}, reportInterval)

/**
 * @param {string} origin
 * @returns {Object}
 */
function getStats(origin) {
	if (origin in statsByOrigin) {
		return statsByOrigin[origin]
	}

	return (statsByOrigin[origin] = {
		origin: origin,
		interval: reportInterval,
		write: {
			bytes: 0,
			logs: 0,
			avgSize: 0,
			'log/s': 0,
			'kiB/s': 0
		}
	})
}