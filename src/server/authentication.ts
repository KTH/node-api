'use strict'

// eslint-disable-next-line no-shadow
import { Request } from 'express'

const log = require('@kth/log')
const apiKey = require('kth-node-api-key-strategy')
const passport = require('passport')
const config = require('./configuration').server

const server = require('./server')

const ApiKeyStrategy = apiKey.Strategy
const options = { log }
const verify = (req: Request, apikey: string, done: () => void) => {
  apiKey.verifyApiKey(req, apikey, config.api_keys, done)
}
const strategy = new ApiKeyStrategy(options, verify)

/**
 * In a Express-based application, passport.initialize() middleware is required to initialize Passport.
 * If your application uses persistent login sessions, passport.session() middleware must also be used.
 */
server.use(passport.initialize())

passport.use(strategy)

log.info('Authentication initialized')
