/**
 * @file Simple.logger
 * @version 1.0.0
 * @author Phoenix Song <github.com/azusa0127>
 * @copyright Phoenix Song (c) 2017
 */
/**
 * ============================================================================
 * Requires.
 * ============================================================================
 */
const path = require('path')
const { createWriteStream } = require('fs')
const { format, inspect } = require('util')
/**
 * ============================================================================
 * Library.
 * ============================================================================
 */
class Logger {
  /**
   * Creates an instance of Logger.
   * @param {(Object|string)} [options={}] Logger options or prefix value
   * @param {string} [options.level='info'] Log Level. Determines the verboseness of the logger.
   * @param {string} [options.prefix=''] Prefix label. The Label showed infront of every message.
   * @param {number} [options.indent=0] Initial indentation. The initial number of spaces to indent.
   * @param {Object} [options.outStream=[stdout, stderr]]
   * @memberof Logger
   */
  constructor(opt = {}) {
    let { level = 'info', prefix = '', indent = 0, outStream } = opt
    if (typeof opt === 'string') prefix = opt
    this.LEVELS = ['error', 'warn', 'info', 'log', 'debug', 'trace']
    this.logLevel = this._validateChannelInput(level)
    this.logPrefix = typeof prefix === 'string' ? prefix : ''
    this.logIndent = typeof indent === 'number' ? indent : 0
    this._console = outStream
      ? Array.isArray(outStream)
        ? new console.Console(...outStream)
        : new console.Console(outStream, outStream)
      : console
  }
  /**
   * Internal channel input validator.
   *
   * @param {any} channel a channel/level input.
   * @returns {string} a valid channel string.
   * @memberof Logger
   */
  _validateChannelInput(channel) {
    if (typeof channel !== 'string') throw new Error('log channel/level must be a string!')
    if (!this.LEVELS.includes(channel)) throw new Error(`Invalid log channel/level ${channel}!`)
    return channel
  }
  /**
   * Internal write function, controls output template and output level control.
   *
   * @param {any} data Data to be written.
   * @param {string} [channel='info'] Log Channel.
   * @param {(string|Buffer)} [prefix=''] Sub-Prefix label.
   * @param {bool} [rawFormat=false] If output in the raw format.
   * @return {bool} If message emitted or not.
   * @memberof Logger
   */
  _write(data, { channel = 'info', prefix = '', rawFormat = false, indentAfter = 0 }) {
    if (
      this.LEVELS.indexOf(this._validateChannelInput(channel)) > this.LEVELS.indexOf(this.logLevel)
    )
      return false
    const timeStamp = `${new Date().toLocaleString()}|`
    // Format prefixes.
    const prefixes = rawFormat
      ? ''
      : format(
          '%s%s%s%s%s%s',
          timeStamp,
          ' '.repeat(5 - channel.length),
          channel.toUpperCase(),
          this.logPrefix.length ? `|${this.logPrefix}|` : '|',
          ' '.repeat(this.logIndent),
          prefix.length ? ` <${prefix}> ` : '',
        )
    // Re-format object string.
    if (typeof data !== 'string') data = inspect(data, false, 10, true)
    const message =
      data.indexOf('\n') !== data.lastIndexOf('\n') && !rawFormat
        ? `${prefixes}\n${data}`
        : format(prefixes, data)
    switch (channel) {
      case 'trace':
        this._console.log(prefixes)
        this._console.trace(data)
        break
      case 'error':
      case 'warn':
        this._console.error(message)
        break
      case 'info':
      case 'log':
      case 'debug':
        this._console.log(message)
        break
      default:
        throw new Error(`Invalid Channel ${channel}!`)
    }
    // Change Indentation
    this.logIndent += indentAfter
    return true
  }
  /**
   * Log data on 'error' channel with Console.error().
   *
   * @param {any} data Data to be written.
   * @param {string|Buffer} [prefix=''] Prefix label.
   * @return {boolean} If message emitted or not.
   * @memberof Logger
   */
  error(data, prefix = '') {
    return this._write(data, { channel: 'error', prefix })
  }
  /**
   * Log data on 'warn' channel with Console.error().
   *
   * @param {any} data Data to be written.
   * @param {string|Buffer} [prefix=''] Prefix label.
   * @return {boolean} If message emitted or not.
   * @memberof Logger
   */
  warn(data, prefix = '') {
    return this._write(data, { channel: 'warn', prefix })
  }
  /**
   * Log data on 'info' channel with Console.log().
   *
   * @param {any} data Data to be written.
   * @param {string|Buffer} [prefix=''] Prefix label.
   * @return {boolean} If message emitted or not.
   * @memberof Logger
   */
  info(data, prefix = '') {
    return this._write(data, { channel: 'info', prefix })
  }
  /**
   * Log data on 'log' channel with Console.log().
   *
   * @param {any} data Data to be written.
   * @param {string|Buffer} [prefix=''] Prefix label.
   * @return {boolean} If message emitted or not.
   * @memberof Logger
   */
  log(data, prefix = '') {
    return this._write(data, { channel: 'log', prefix })
  }
  /**
   * Log data on 'debug' channel with Console.log().
   *
   * @param {any} data Data to be written.
   * @param {string|Buffer} [prefix=''] Prefix label.
   * @return {boolean} If message emitted or not.
   * @memberof Logger
   */
  debug(data, prefix = '') {
    return this._write(data, { channel: 'debug', prefix })
  }
  /**
   * Log data on 'trace' channel with Console.trace().
   *
   * @param {any} data Data to be written.
   * @param {string|Buffer} [prefix=''] Prefix label.
   * @return {boolean} If message emitted or not.
   * @memberof Logger
   */
  trace(data, prefix = '') {
    return this._write(data, { channel: 'trace', prefix })
  }
  /**
   * Output data without formating.
   *
   * @param {any} data Data to be written.
   * @param {string} [channel='info'] Output Channel.
   * @return {boolean} If message emitted or not.
   * @memberof Logger
   */
  raw(data, channel = 'info') {
    return this._write(data, { channel, rawFormat: true })
  }
  /**
   * Group the logger calls by block and indent following logs.
   *
   * @param {string|Buffer} label Group label.
   * @param {string} [channel='info'] Log Channel.
   * @return {boolean} If message emitted or not.
   * @memberof Logger
   */
  enterBlock(label, channel = 'info') {
    return this._write(`[${label}] Begin...`, { channel, indentAfter: 2 })
  }
  /**
   * Ending the logger call block and unindent logs after.
   *
   * @param {string|Buffer} label Group label.
   * @param {string} [channel='info'] Log Channel.
   * @return {boolean} If message emitted or not.
   * @memberof Logger
   */
  exitBlock(label, channel = 'info') {
    return this._write(`[${label}] Completed!`, { channel, indentAfter: -2 })
  }
  /**
   * Change the Instance Log Level.
   *
   * @param {string} [level='info']
   * @return {string} Previous Log Level pre-reassignment.
   * @memberof Logger
   */
  setLogLevel(level = 'info') {
    const prevLevel = this.logLevel
    this.logLevel = this._validateChannelInput(level)
    return prevLevel
  }
}

class FileLogger extends Logger {
  /**
   * FileLogger Constructor
   *
   * @param {string|string[]} filename The name of the log files, can be either a single file for both stdout and stderr or a pair of files as [stdout, stderr].
   *
   * @param {string} [Options.level='info'] Log Level. Determines the verboseness of the logger.
   * @param {string} [Options.prefix=''] Prefix label. The Label showed infront of every message.
   * @param {number} [Options.indent=0] Initial indentation. The initial number of spaces to indent.
   */
  constructor(filename, { level, prefix, indent } = {}) {
    const outStream = Array.isArray(filename)
      ? filename.map(x => path.resolve(x)).map(x => createWriteStream(x))
      : createWriteStream(path.resolve(filename))
    super({ level, prefix, indent, outStream })
  }
}
/**
 * ============================================================================
 * Exports.
 * ============================================================================
 */
module.exports = { Logger, FileLogger }
