# 2.0.0

## Breaking change
Let's move forward: node v0.10 is no longer supported. We were not testing in it for a while.

## Other changes
* Added: store last login for each user
* Added: display last login datetime in `node index list-users`
* Added: report about write load every hour
* Added: optional config field `reportInterval` to change default (1h) report interval
* Changed: use unsafe write when logging without a callback to speed things up