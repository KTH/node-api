'use strict'

const log = require('@kth/log')
const mongoose = require('mongoose')
const config = require('./configuration').server

const connect = () => {
  mongoose
    .connect(config.mongodb.connectionString, { dbName: config.mongodb.databaseName })
    .then(() => {
      log.info('MongoDB: connected')
    })
    .catch(err => {
      log.error({ err }, 'MongoDB: ERROR connecting DB')
    })
}

const isOk = () => mongoose.connection.readyState === 1

module.exports = { connect, isOk }
