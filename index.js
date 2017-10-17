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
const { inspect } = require('util')
/**
 * ============================================================================
 * Library.
 * ============================================================================
 */
const LEVELS_MAPPING = {
  error: 0,
  warn: 1,
  info: 2,
  log: 3,
  debug: 4,
  trace: 5,
}

function validateChannelInput(channel) {
  switch (channel) {
    case 'error':
    case 'warn':
    case 'info':
    case 'log':
    case 'debug':
    case 'trace':
      return channel
    default:
      throw new TypeError(`Invalid log channel/level ${channel}`)
  }
}

const formatTimeStamp = (showTime = true) => (showTime ? `${new Date().toLocaleString()}|` : '')

const formatChannel = (channel, showChannel = true) =>
  showChannel ? `${channel.toUpperCase()}${' '.repeat(5 - channel.length)}|` : ''

const formatPrefixes = (globalPrefix, localLabel) =>
  globalPrefix && localLabel
    ? `${globalPrefix} <${localLabel}>`
    : globalPrefix ? `${globalPrefix}|` : localLabel ? `<${localLabel}>` : ''

const formatData = (channel = 'info', data) =>
  LEVELS_MAPPING[channel] === 4 && typeof data !== 'string'
    ? `\n${inspect(data, false, 10, true)}`
    : data

/**
 * ============================================================================
 * Logger.
 * ============================================================================
 */
class Logger {
  constructor(opt = {}) {
    let {
      level = 'info',
      prefix = '',
      outStream = [process.stdout, process.stderr],
      showTime = true,
      showChannel = true,
    } = opt
    if (typeof opt === 'string') prefix = opt
    this.logLevel = LEVELS_MAPPING[validateChannelInput(level)]
    this.logPrefix = typeof prefix === 'string' ? prefix : ''
    this._console = Array.isArray(outStream)
      ? new console.Console(outStream[0], outStream[1])
      : new console.Console(outStream, outStream)
    this.showTime = showTime
    this.showChannel = showChannel

    this.indent = 0
  }
  _write(
    { channel = 'info', label = '', showTime = true, showChannel = true, indentAfter = 0 },
    data,
  ) {
    if (LEVELS_MAPPING[validateChannelInput(channel)] > this.logLevel) return false

    const message = `${[
      formatTimeStamp(showTime),
      formatChannel(channel, showChannel),
      formatPrefixes(this.logPrefix, label),
      ' '.repeat(this.indent),
    ]
      .filter(x => x)
      .join('')} ${formatData(channel, data)}`

    switch (channel) {
      case 'trace':
        this._console.trace(message)
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
  error(data, label = '') {
    return this._write({ channel: 'error', label }, data)
  }
  warn(data, label = '') {
    return this._write({ channel: 'warn', label }, data)
  }
  info(data, label = '') {
    return this._write({ channel: 'info', label }, data)
  }
  log(data, label = '') {
    return this._write({ channel: 'log', label }, data)
  }
  debug(data, label = '') {
    return this._write({ channel: 'debug', label }, data)
  }
  trace(data, label = '') {
    return this._write({ channel: 'trace', label }, data)
  }
  group(label = '', channel = 'info') {
    if (LEVELS_MAPPING[validateChannelInput(channel)] <= this.logLevel) this._console.group(label)
  }
  groupEnd(channel = 'info') {
    if (LEVELS_MAPPING[validateChannelInput(channel)] <= this.logLevel) this._console.groupEnd()
  }
  enterBlock(label, channel = `info`) {
    return this._write({ channel, indentAfter: 2 }, `[${label}] Begin...`)
  }
  exitBlock(label, channel = `info`) {
    return this._write({ channel, indentAfter: -2 }, `[${label}] Completed!`)
  }
  setLogLevel(level = 'info') {
    const prevLevel = this.logLevel
    this.logLevel = validateChannelInput(level)
    return prevLevel
  }
}

class FileLogger extends Logger {
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
