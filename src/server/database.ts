'use strict'

const log = require('@kth/log')
const nodeMongo = require('@kth/mongo')
const config = require('./configuration').server

const mongoOptions = {
  user: config.db.username,
  pass: config.db.password,
  ssl: config.db.ssl,
  dbUri: config.db.authDatabase !== '' ? config.db.uri + `?authSource=${config.db.authDatabase}` : config.db.uri,
  logger: log,
}

export = {
  connect: function connect() {
    nodeMongo
      .connect(mongoOptions)
      .then(() => {
        log.info('MongoDB: connected')
      })
      .catch((err: Error) => {
        log.error({ err }, 'MongoDB: ERROR connecting DB')
      })
  },
}
