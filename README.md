# simple.logger

A simple logger for node.

2.0.0 released, a better viewport with colors!

* Proper JSDoc for ts types.
* Better object output.
* Colored prefixes based on channels.

![Screenshot](https://github.com/azusa0127/images/raw/master/SimpleLoggerScreenshot.png 'simple-logger 2.0')

## API

## Constructor

```js
const { Logger, FileLogger } = require('simple.logger');

const optionalOptions = {
  level: 'info',
  prefix: '',
  outStream: [process.stdout, process.stderr],
  showTime: true,
  shortTime: false,
  showChannel: true,
};
// Sample constructions.
const logger = new Logger(optionalOptions);
const prefixLogger = new Logger('LOG PREFIX');
const fileLogger1 = new FileLogger('./logs.log', optionalOptions);
const fileLogger2 = new FileLogger(['./stdout.log', './stderr.log'], optionalOptions);
```

#### Options

* @typedef {Object} LoggerOptions - Constructor params for Logger.
* @prop {string} [level='info'] - Log level <error|warn|info|log|debug|trace>.
* @prop {string} [prefix=''] - Prefix on every logging message.
* @prop {Object|Array<Object>} [outStream=[process.stdout, process.stderr]] - Output writable streams.
* @prop {boolean} [showTime=true] - Toggle date and time display in message prefixes.
* @prop {boolean} [shortTime=false] - Toggle date display in message prefixes.
* @prop {boolean} [showChannel=ture] - Toggle logging channel display in message prefixes.
* @prop {boolean} [colored=true] - Toggle colored style output.

## Methods

#### `logger.changeLogLevel(level = 'info')`

This method can change logger's verbose level on the fly and returns the **previous level** before changed.

### Message logging methods - _All the following method will yield a message with a log prefix pertentially contains **channel**, **timestamp** and custom **prefix**._

#### `logger.error([data][, ...args])`

Same as [console.error([data][, ...args])](https://nodejs.org/api/console.html#console_console_error_data_args), with verbose level control.

#### `logger.warn([data][, ...args]`

Same as [console.warn([data][, ...args])](https://nodejs.org/api/console.html#console_console_warn_data_args), with verbose level control.

#### `logger.info([data][, ...args])`

Same as [console.info([data][, ...args])](https://nodejs.org/api/console.html#console_console_info_data_args), with verbose level control.

#### `logger.log([data][, ...args])`

Same as [console.log([data][, ...args])](https://nodejs.org/api/console.html#console_console_log_data_args), with verbose level control.

#### `logger.debug([data][, ...args])`

Same as [console.debug([data][, ...args])](https://nodejs.org/api/console.html#console_console_debug_data_args), with verbose level control.

#### `logger.trace([message][, ...args])`

Same as [console.trace([message][, ...args])](https://nodejs.org/api/console.html#console_console_trace_message_args), with verbose level control.

#### `logger.raw([data][, ...args])`

Same as `logger.info([data][, ...args])`, _with **no** log formatting._

### Grouping and Indenting - _The following method will indent context and helps organizing logs better._

_`group` and `groupEnd` will indent the whole line including formatted prefixes._

#### `logger.group(label = '', channel = 'info')`

#### `logger.groupEnd(channel = 'info')`

_`enterBlock` and `exitBlock` will only indent the context after formatted prefixes._

#### `enterBlock(label, channel =`info`)`

#### `exitBlock(label, channel =`info`)`

## Sample

A quick sample is provided as [example.js](./example.js)

## License

Licensed under [MIT](./LICENSE).
