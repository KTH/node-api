'use strict'

// These settings are used by the server
import serverSettings from '../config/serverSettings'

const { generateConfig } = require('kth-node-configuration')

const serverConfig = generateConfig([serverSettings])

export { serverConfig }
