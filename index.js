/**
 * @file Simple.logger
 * @version 2.0.0
 * @author Phoenix Song <github.com/azusa0127>
 * @copyright Phoenix Song (c) 2017-2018
 */
/**
 * ============================================================================
 * Requires.
 * ============================================================================
 */
const path = require('path');
const { createWriteStream } = require('fs');

const style = require('ansi-styles');
const { stringify } = require('q-i');

/**
 * ============================================================================
 * Library.
 * ============================================================================
 */
const EOL = process.platform === 'win' ? '\r\n' : '\n';

const LEVELS_MAPPING = {
  error: 0,
  warn: 1,
  info: 2,
  log: 3,
  debug: 4,
  trace: 5,
};

const LEVELS_SYMBOL = {
  error: 'ERR',
  warn: 'WRN',
  info: 'IFO',
  log: 'LOG',
  debug: 'DBG',
  trace: 'TCE',
};

const LEVELS_STYLE = {
  error: style.red,
  warn: style.yellow,
  info: style.reset,
  log: style.dim,
  debug: style.magenta,
  trace: style.cyan,
};

function validateChannelInput (channel) {
  switch (channel) {
    case 'error':
    case 'warn':
    case 'info':
    case 'log':
    case 'debug':
    case 'trace':
      return channel;
    default:
      throw new TypeError(`Invalid log channel/level ${channel}`);
  }
}

const padLeft = (x, len, symbol = ' ') => symbol.repeat(len) + x;
const padRight = (x, len, symbol = ' ') => x + symbol.repeat(len);

const padEOLandIndent = (message, indent = 0) =>
  /\r?\n/.test(message)
    ? padRight(EOL, indent) + message.split(/\r?\n/).join(padRight(EOL, indent))
    : padLeft(message, indent);

/**
 * ============================================================================
 * Logger.
 * ============================================================================
 */

/**
 * @typedef {Object} LoggerOptions - Constructor params for Logger.
 * @prop {string} [level='info'] - Log level <error|warn|info|log|debug|trace>.
 * @prop {string} [prefix=''] - Prefix on every logging message.
 * @prop {Object|Array<Object>} [outStream=[process.stdout, process.stderr]] - Output writable streams.
 * @prop {boolean} [showTime=true] - Toggle date and time display in message prefixes.
 * @prop {boolean} [shortTime=false] - Toggle date display in message prefixes.
 * @prop {boolean} [showChannel=ture] - Toggle logging channel display in message prefixes.
 * @prop {boolean} [colored=true] - Toggle colored style output.
 */
class Logger {
  /**
   * Create a new Logger.
   * @param {LoggerOptions|string} [opt={}] Constructor params for Logger.
   * @prop {string} [opt.level='info'] - Log level <error|warn|info|log|debug|trace>.
   * @prop {string} [opt.prefix=''] - Prefix on every logging message.
   * @prop {Object|Array<Object>} [opt.outStream=[process.stdout, process.stderr]] - Output writable streams.
   * @prop {boolean} [opt.showTime=true] - Toggle date and time display in message prefixes.
   * @prop {boolean} [opt.shortTime=false] - Toggle date display in message prefixes.
   * @prop {boolean} [opt.showChannel=ture] - Toggle logging channel display in message prefixes.
   * @prop {boolean} [opt.colored=true] - Toggle colored style output.
   * @return {Logger}
   */
  constructor (opt = {}) {
    let {
      level = 'info',
      prefix = '',
      outStream = [process.stdout, process.stderr],
      showTime = true,
      shortTime = false,
      showChannel = true,
      colored = true,
    } = opt;
    if (typeof opt === 'string') prefix = opt;
    this.logLevel = LEVELS_MAPPING[validateChannelInput(level)];
    this.logPrefix = typeof prefix === 'string' ? prefix : '';
    this._console = Array.isArray(outStream)
      ? new console.Console(outStream[0], outStream[1])
      : new console.Console(outStream);
    this.showTime = showTime;
    this.shortTime = shortTime;
    this.showChannel = showChannel;
    this.logIndent = 0;
    this.colored = colored;
  }

  _formatData (channel = 'info', label = null, ...data) {
    return padEOLandIndent(
      ((label && `<${label}> `) || '') +
        data
          .map(
            x =>
              typeof x !== 'string' && channel !== 'error' && channel !== 'trace'
                ? `${this.colored ? stringify(x) : JSON.stringify(x, null, 2)}\n`
                : x
          )
          .join(' '),
      this.logIndent
    );
  }

  _write (
    {
      channel = 'info',
      label = '',
      indentAfter = 0,
      showTime = this.showTime,
      showChannel = this.showChannel,
      shortTime = this.shortTime,
    },
    ...data
  ) {
    if (LEVELS_MAPPING[channel] > this.logLevel) return false;

    // Change Indentation
    if (indentAfter < 0) this.logIndent += indentAfter;

    const channelStyle = LEVELS_STYLE[channel];
    const prefixes = `${[
      showChannel ? LEVELS_SYMBOL[channel] : '',
      showTime ? (shortTime ? new Date().toLocaleTimeString() : new Date().toLocaleString()) : '',
      this.logPrefix,
    ]
      .filter(x => x)
      .join(' ')}|`;

    const message = `${(this.colored && `${channelStyle.open}${prefixes}${channelStyle.close}`) ||
      prefixes} ${this._formatData(channel, label, ...data)}`;

    switch (channel) {
      case 'trace':
        this._console.error(message.substr(0, message.indexOf('|') + 1));
        this._console.trace(...data);
        break;
      case 'error':
      case 'warn':
        this._console.error(message);
        break;
      case 'info':
      case 'log':
      case 'debug':
        this._console.log(message);
        break;
      default:
        throw new Error(`Invalid Channel ${channel}!`);
    }
    // Change Indentation
    if (indentAfter > 0) this.logIndent += indentAfter;
    return true;
  }
  error (...data) {
    return this._write({ channel: 'error' }, ...data);
  }
  warn (...data) {
    return this._write({ channel: 'warn' }, ...data);
  }
  info (...data) {
    return this._write({ channel: 'info' }, ...data);
  }
  log (...data) {
    return this._write({ channel: 'log' }, ...data);
  }
  debug (...data) {
    return this._write({ channel: 'debug' }, ...data);
  }
  trace (...data) {
    return this._write({ channel: 'trace' }, ...data);
  }
  raw (...data) {
    return this.console.log(...data);
  }
  group (label = '', channel = 'info') {
    if (LEVELS_MAPPING[validateChannelInput(channel)] <= this.logLevel) this._console.group(label);
  }
  groupEnd (channel = 'info') {
    if (LEVELS_MAPPING[validateChannelInput(channel)] <= this.logLevel) this._console.grouppEnd();
  }
  enterBlock (label, channel = `info`) {
    return this._write({ channel, label, indentAfter: 2 }, `--- Start ---`);
  }
  exitBlock (label, channel = `info`) {
    return this._write({ channel, label, indentAfter: -2 }, `--- Complete ---`);
  }
  changeLogLevel (level = 'info') {
    const prevLevel = this.logLevel;
    this.logLevel = validateChannelInput(level);
    return prevLevel;
  }
}

/**
 * @typedef {Object} FileLoggerOptions - Constructor params for FileLogger.
 * @prop {string} [level='info'] - Log level <error|warn|info|log|debug|trace>.
 * @prop {string} [prefix=''] - Prefix on every logging message.
 * @prop {boolean} [showTime=true] - Toggle date and time display in message prefixes.
 * @prop {boolean} [shortTime=false] - Toggle date display in message prefixes.
 * @prop {boolean} [showChannel=ture] - Toggle logging channel display in message prefixes.
 */

class FileLogger extends Logger {
  /**
   * Create a new FileLogger.
   * @param {string|Array<string>} filename - Log file paths [stdout|stderr].
   * @param {FileLoggerOptions|string} [opt={}] Constructor params for Logger.
   * @prop {string} [opt.level='info'] - Log level <error|warn|info|log|debug|trace>.
   * @prop {string} [opt.prefix=''] - Prefix on every logging message.
   * @prop {boolean} [opt.showTime=true] - Toggle date and time display in message prefixes.
   * @prop {boolean} [opt.shortTime=false] - Toggle date display in message prefixes.
   * @prop {boolean} [opt.showChannel=ture] - Toggle logging channel display in message prefixes.
   * @return {Logger}
   */
  constructor (filename, opts = {}) {
    const outStream = Array.isArray(filename)
      ? filename.map(x => path.resolve(x)).map(x => createWriteStream(x))
      : createWriteStream(path.resolve(filename));
    super(Object.assign(opts, { colored: false, outStream }));
  }
}
/**
 * ============================================================================
 * Exports.
 * ============================================================================
 */
module.exports = { Logger, FileLogger };
