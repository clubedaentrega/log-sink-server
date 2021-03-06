'use strict'

let commander = require('commander'),
	fs = require('fs'),
	command

// Set up mongoose
require('./mongoose').start(() => {
	// Set up reporter
	require('./lib/reporter')

	// Log ourselves
	require('./lib/logger').info('run', process.argv.slice(2))

	// Set up program CLI
	fs.readdirSync('./lib/cli').forEach(file => {
		if (/\.js$/.test(file)) {
			require('./lib/cli/' + file)
		}
	})
	commander.on('*', () => {
		throw new Error('Command not found')
	})
	commander.option('--test-mode', 'Disable password for users "test" and "test2" (use it ONLY for running the test suite)')
	command = commander.parse(process.argv).args[0]

	if (!command) {
		// Set up asynconnection server
		// (but only if we're not executing any subcommand)
		require('./lib/server').start(() => {
			if (process.send) {
				process.send('online')
			}
		})
	}
})