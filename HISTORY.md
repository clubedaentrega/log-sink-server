# 5.0.0

## Breaking changes
* Drop support for Node.JS < 6
* Add support for MongoDB 3.6

# 4.1.1
* Changed: update dependencies
* Changed: successful queries are no longer logger, to reduce the volume of meta-logs

# 4.1.0
* Changed: updated mongoose to 4.4

# 4.0.0

## Breaking change
`npm start` now uses `pm2` instead of `forever`

## Other changes
* Updated dependencies

# 3.0.0

## Breaking change (possibly)
Logs created by log-sink itself are stored as low priority now (it was normal before)

# 2.0.0

## Breaking change
Let's move forward: node v0.10 is no longer supported. We were not testing in it for a while.

## Other changes
* Added: store last login for each user
* Added: display last login datetime in `node index list-users`
* Added: report about write load every hour
* Added: optional config field `reportInterval` to change default (1h) report interval
* Changed: use unsafe write when logging without a callback to speed things up