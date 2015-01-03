# Log Sink Server
A log service, for streaming, storage and queries of log data

## Install
The easiest way to get going is to clone the github repo, edit the `config.json` file and them `node index`.

## Features
* accept incoming stream of log data from producers
* route and stream log data to consumers, based on filters set by them
* save data for querying later
* native support for secure connections (TLS)
* simple and useful permission model
* offer a simple (non-streaming) api over HTTP (*this is planned, not done*)

## Core concepts
This service was created with some core design principles, explained bellow

### Streaming
Using a model based on streaming data reduces overhead when compared to a request-response model, since there is no round-trip and one only connection is kept.

Log-sink offers two live streams:

* for producers, to send log data to log-sik
* for consumers, to receive log data routed by log-sink

### Standard log format
Log-sink does not enforce a rigid log format, but offers some standard fields that it optimizes for. Those fields are divided in two groups:

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

Use of standard fields is encouraged, since both transmission and query is much faster on them.

### Relevance
Log sink divide all log data in three groups, based on their relevance: bellow normal, normal and above normal. Logs with different relevance levels are stored and indexed separately, improving querying on them.

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

*WIP*

## API

## CLI