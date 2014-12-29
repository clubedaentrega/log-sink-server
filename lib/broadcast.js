/**
 * @file A global instance of a EventEmitter
 * This is used to share events between different parts of the server
 */
'use strict'

/**
 * @event connection
 * @type {Peer}
 */

/**
 * @event log
 * @type {LogData}
 */

/**
 * @typedef {Object} LogData
 * @param {string} origin
 * @param {Date} date
 * @param {string} name
 * @param {number} level
 * @param {number} relevance
 * @param {?number} time
 * @param {?string} message
 * @param {?Buffer} commit
 * @param {?*} extra
 */

module.exports = new (require('events').EventEmitter)