# Log Sink Server - API
This file describes the public API of log sink server.

As said in the [README](https://github.com/sitegui/log-sink-server/blob/master/README.md), the API is built on top of [asynconnection](https://github.com/sitegui/asynconnection-core) protocol, a call-return/message protocol over tls.

## Write API
This API is used to send logs to this service.

### message:1 - log(logData)
Send a log in a fire-and-forget fashion. `logData` is an object with the following fields:

* `date`: date  
When the log was generated. Note that this is *not* an optional field, since the server can't assume the log was generated when it receives it.
* `name`: string  
The log "class". May be an endpoint url, function name, file name or anything that identifies this log inside the source application
* `level`: uint  
Recommended values: 0=debug, 1=info, 2=warn, 3=error, 4=fatal. But other values can also be used
* `relevance`: uint  
Must be one of: 0=bellow normal, 1=normal, 2=above normal
* `time`: optional uint  
Any time related to this log, may be the endpoint response time, function execution time, etc
* `message`: optional string  
A log message, e.g. the error description
* `commit`: optional Buffer  
The revision name (in octets), e.g. in git this has 20 bytes (SHA1 output)
* `extra`: optional json  
Any JSON-compatible data (number, string, boolean, null, array or object)

### call:1 - log(logData)
`logData` is an object with the exact same fields as described above. The *only* difference between this call and the message is the call receives the feedback about the operation result.

For example, if an application sends a log with a missing required field (like date) via message (the method above), it will be silently ignored. Using the call (this method), it will get an error back.

For performance, use the message method. For debug, use the call method.

Note that either method (message or call) will have the exactly same result. The server will *not* try harder to save a log sent by a call. So if you won't do nothing useful with an error response, don't use the call method (for performance sake).

### POST /log
This is the HTTPS endpoint. As discussed in the README, this alternative API over HTTPS is offered to allow a wider range of producers to send data to log sink. Note that the server binds to another port (as set in `config.js`) for this API.

Using the API over asynconnection (described above) is better for performance and throughput.

The user/password credentials must be informed using HTTP's [basic authentication](http://en.wikipedia.org/wiki/Basic_access_authentication).

The payload must be JSON-encoded and the `Content-Type` header must be set to `application/json`.

The payload is an object with the same keys as listed above. The only differences are:

* the `date` field is a string representation of the date, as defined by 'Combined date and time' [ISO-8601](http://en.wikipedia.org/wiki/ISO_8601)
* the `commit` field is a string with the data hex-encoded, like: '069276428dc4594f82d298aa0c3ddbebc93f7928'.

The endpoint response will be a JSON formatted object with the keys:

* `ok`: boolean  
Whether the log was inserted or not
* `error`: optional string  
If `ok` is false, this will tell what have happened

## Stream API
This API streams live log data from producers to consumers and allows filtering the log that will be streamed.

### call:2 - setStream(options)
Create a new log stream. `options` is an object with the following fields:

* `id`: string  
A name to give to this stream. This id will be used to shutdown the stream, for example
* `includeExtra`: boolean  
If you are interested in the `extra` field, set this to `true`. Otherwise, keep it `false` to reduce network usage and latency
* `filter`: Object  
Let's the application declare which logs it wants to receive. An object with:
	* `origin`: string  
	The producer's user name. This is the only required field. You must have read access to logs from that user. You can always read your own data.
	* `name`: optional string  
	An exact match for the log name
	* `nameRegex`: optional regex  
	A regex to match against the log name (ignored if `name` is present)
	* `level`: optional Range  
	A range (see bellow) for the log level
	* `relevance`: optional Range  
	A range (see bellow) for the log relevance
	* `time`: optional Range  
	A range (see bellow) for the log time field
	* `message`: optional string  
	An exact match for the log message
	* `messageRegex`: optional regex  
	A regex to match against the log message (ignored if `message` is present)
	* `commit`: optional Buffer  
	An exact match for the log commit field

`Range` is an object with two optional keys with numeric (uint) value: `min` and `max`. Both ends are inclusive, that is `17` fits `{min:17,max:17}`

If the stream is created successfully, the server will start sending `stream` (server-message:1) to the application (see bellow)

### call:3 - unsetStream(id) -> boolean
Shutdown the stream (given its id as string). The returned boolean tells whether the stream was active.

### call:4 - unsetAllStreams()
Shutdown all streams set by this connection. Streams created by other connections, even those under the same user/password, are not affected. There is no need to call this before closing the connection, the server will shutdown the streams by itself. In fact, this call is near useless.

### server-message:1 - stream(data)
After a stream is set, the server will send these messages to the application.

`data` is an object with:

* `id`: string  
The stream 'name'
* `includeExtra`: boolean  
Whether the stream was set to include the `extra` field in the logs
* `log`: Object
	* `origin`: string
	* `date`: date
	* `name`: string
	* `level`: uint
	* `relevance`: uint
	* `time`: optional uint
	* `message`: optional string
	* `commit`: optional Buffer
	* `extra`: optional json  
	Only present if the original log has this field and `includeExtra` is true

## Query API
The query API is used to query old log data

### call:5 - query(options) -> logs
`options` is an object with:

* `includeExtra`: boolean
* `limit`: uint  
At most, how many logs to return
* `skip`: optional uint  
How much logs to skip. This is used to provide paginated results
* `sort`: optional string
The order used to return the logs. This is expressed as a space-separated string of field names. For example: `'time -message extra.myOwnField'` means order by `time` asc, then `message` desc then `extra.myOwnField` asc. The default is `'date'` (asc date)
* `query`: Object
	* `origin`: string
	* `date`: Object
		* `min`: date
		* `max`: optional date
	* `relevance`: uint
	* `name`: optional string
	* `nameRegex`: optional regex
	* `level`: optional Range
	* `time`: optional Range
	* `message`: optional string
	* `messageRegex`: optional regex
	* `commit`: optional Buffer
	* `extra`: optional json

Note that `options.query` is very similiar to a stream filter, but with some important differences:

* a start date must be informed in `date.min`
* exactly one value must be queried for `relevance`, since logs with different relevances are not stored together
* the `extra` can also be queried. See the [official docs](http://docs.mongodb.org/manual/tutorial/query-documents/) for more on the syntax

This call returns an array of logs, each element is an object with:

* `origin`: string
* `date`: date
* `name`: string
* `level`: uint
* `relevance`: uint
* `time`: optional uint
* `message`: optional string
* `commit`: optional Buffer
* `extra`: optional json