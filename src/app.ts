'use strict'

require('dotenv').config()

const fs = require('fs')
const log = require('@kth/log')
const server = require('./server/server')

import { serverConfig as config } from './server/configuration'

const packageFile = require('../package.json')

// catches uncaught exceptions
process.on('uncaughtException', (err, origin) => {
  if (err.toString().match(/(ECONNRESET|MongoNetworkError)/i)) {
    log.warn(`DB connection reset origin (${origin})`, { err })
  } else {
    log.error('APPLICATION EXIT - uncaught exception in ', packageFile.name)
    log.error(`Uncaught Exception, origin (${origin})`, { err })
    process.exit(1)
  }
})
// catches unhandled promise rejections
process.on('unhandledRejection', reason => {
  // This line below provokes an uncaughtException and will be caught few lines
  // above
  log.error(`unhandledRejection  ${packageFile.name}`, reason)
  // throw reason
})

function checkEnvironment() {
  try {
    log.info(`Checking environment variables from .env.ini file.`)
    const lines: Array<string> = fs
      .readFileSync('./.env.ini')
      .toString()
      .split('\n')
      .filter((l: string) => l && l.trim() && !l.startsWith('#'))
      .filter((l: string) => l)

    const isDevelopment = process.env.NODE_ENV !== 'production'
    lines.forEach((l: string) => {
      const name = l.substring(0, l.indexOf('=')).trim()
      if (name && process.env[name] !== undefined) {
        log.debug(`   Environment variable '${name}' found`)
      } else if (isDevelopment) {
        log.debug(`   Environment variable '${name}' is missing, most likely there is a default value.`)
      } else {
        log.warn(`   Environment variable '${name}' is missing.`)
      }
    })
    log.info(`Checking environment variables completed.`)
  } catch (err) {
    log.error({ err }, `Failed to check environment variables`)
  }
}
checkEnvironment()

/* ****************************
 * ******* SERVER START *******
 * ****************************
 */
export default server.start({
  useSsl: config.useSsl,
  pfx: config.ssl.pfx,
  passphrase: config.ssl.passphrase,
  key: config.ssl.key,
  ca: config.ssl.ca,
  cert: config.ssl.cert,
  port: config.port,
  logger: log,
})
