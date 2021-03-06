# Log Sink Server
[![Build Status](https://travis-ci.org/clubedaentrega/log-sink-server.svg?branch=master)](https://travis-ci.org/clubedaentrega/log-sink-server)
[![Dependency Status](https://david-dm.org/clubedaentrega/log-sink-server.svg)](https://david-dm.org/clubedaentrega/log-sink-server)

A service for streaming, storage and query of log data.

This is the server-side implementation. For a nodejs implementation of the client-side, see [log-sink](https://github.com/clubedaentrega/log-sink).

## Install
1. Clone [the repo](https://github.com/clubedaentrega/log-sink-server)
2. Copy the file `example-config.js` to `config.js` and edit what you want
3. Start with `node index` or, if you have `forever`, `npm start`

## Features
* accept incoming stream of log data from producers
* route and stream log data to consumers, based on filters set by them
* save data for querying later
* native support for secure connections (TLS)
* simple and useful permission model
* offer a simple (non-streaming) api over HTTPS

## Core concepts
This service was created with some core design principles, explained bellow

### Streaming
Using a model based on streaming data reduces overhead when compared to request-response, since there is no round-trip and only one connection is kept open.

Log sink offers two live streams:

* for producers, to send log data this service
* for consumers, to receive log data routed by this service

### Standard log format
Log sink does not enforce a rigid log format, but offers some standard fields that it optimizes for. Those fields are divided in two groups:

* Required:
	* origin: name of the app which created it (auto-filled for you)
	* date: a date set by the log producer (generally the generation date)
	* name: the action name related with the log (like an endpoint or routine name)
	* level: the log level (info, warn, etc)
* Optional:
	* time: any time measurement related with the log (like execution time)
	* message: any text with more details
	* commit: revision name of the code that created this log

Aside these standard fields, there is a 'anything fits' field, called `extra`.

Use of standard fields is encouraged, since both transmission and query is faster and slimmer on them.

### Relevance
Log sink divides all log data in three groups, based on their relevance: bellow normal, normal and above normal. Logs with different relevance level are stored and indexed separately, improving querying on them.

This model was created to support a huge volume of not-so-relevant logs (eg, logs of pooling operations) mixed with some high-relevance logs (eg, logs of payments).

For more details on how storage deals with those relevance levels, read bellow.

### Security
Log sink gives native support for TLS connections, simply drop your own key and certificate path in the `config.json` file. Please note that (for testing), we include a self-signed certificate. *DO NOT USE them in practice, since those were made public and everybody knows its private key*

### Permissions
The permission model is very simple and pragmatic:

* Every consumer/producer must have an account. This is easy: `node index add-user <user>`
* All accounts can write logs into the service and can read those back.
* By default, the account can only read data itself has produced.
* To allow reading logs created by another account run `node index add-permission <user> <permission>`

See CLI interface bellow for more.

## Storage
Log sink uses mongoDB to store its data. This is a initial decision and may change in the future as we experiment with other tecnologies.

Logs with different relevance level are stored and indexed separately, improving querying on them. That is, logs are stored in three collections, based on their relevance.

Bellow normal and normal relevance logs are stored in capped collections, in order to avoid a huge growth in used space. High relevance logs are stored in a normal collection, so they are never removed.

The log sink software is not responsible for the database, it must be managed independently. The best topology is a replica set with the [read preference](http://docs.mongodb.org/manual/core/read-preference/) set to `'secondaryPreferred'`.

## API
The API exposed by this service is built on top of [asynconnection](https://github.com/sitegui/asynconnection-core) protocol, a call-return/message protocol over tls.

The API is splitted in four parts:

* [Write API](https://github.com/clubedaentrega/log-sink-server/blob/master/api.md#write-api): used to send log data to log sink
* [Stream API](https://github.com/clubedaentrega/log-sink-server/blob/master/api.md#stream-api): streams live log data from producers to consumers
* [Query API](https://github.com/clubedaentrega/log-sink-server/blob/master/api.md#query-api): query old log data
* [Meta API](https://github.com/clubedaentrega/log-sink-server/blob/master/api.md#meta-api): get data about log sink service itself

The write API is also offered over HTTPS.

## CLI
The log sink server offers a command line interface (CLI) to manage users and permissions. To use it, run `node index [command] [args...]` in the project folder. (Use `node index -h` for inline help)

The available commands are:

### add-user
Add a new user to the system. All users can write data and read data created by itself. The user key (password) will be generated for you.
```
node index add-user <user>
```
### add-permission
Add permission for a user to read data from another one
```
node index add-permission <user> <permission>
```
### change-key
Generate another password for this user. Note that it never lets you pick you own password, to avoid human laziness resulting in stupid and weak password (sorry about that)
```
node index change-key <user>
```
### list-users
List all users, their permissions and last login datetime
```
node index list-users
```
### remove-user
remove a user from the system (their log data will be kept)
```
node index remove-user <user>
```
### revoke-permission
revoke a permission from a user to read data from another one
```
node index revoke-permission <user> <permission>
```

## Caveats
Since mongoDB does not allow '$' and '.' in key names, they are [replaced](http://docs.mongodb.org/manual/faq/developers/#faq-dollar-sign-escaping) by '\uFF0E' (＄) and '\uFF04' (．) respectively. This only affects object key names in the extra field: `{a: 'a.b$c'}` is fine, but `{'a.b': 12}` will be saved as `{'a．b': 12}`