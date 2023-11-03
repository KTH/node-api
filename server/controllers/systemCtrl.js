'use strict'

const os = require('os')
const fs = require('fs')
const log = require('@kth/log')
const db = require('@kth/mongo')
const { getPaths } = require('kth-node-express-routing')
const { monitorRequest } = require('@kth/monitor')

const configServer = require('../configuration').server
const version = require('../../config/version')
const packageFile = require('../../package.json')
const Agenda = require('../jobs/worker')

const started = new Date()

/**
 * GET /swagger.json
 * Swagger config
 */
function getSwagger(req, res) {
  res.json(require('../../swagger.json'))
}

/**
 * GET /swagger
 * Swagger
 */
function getSwaggerUI(req, res) {
  const pathToSwaggerUi = require('swagger-ui-dist').absolutePath()
  const swaggerUrl = configServer.proxyPrefixPath.uri + '/swagger.json'
  const petstoreUrl = 'https://petstore.swagger.io/v2/swagger.json'

  const swaggerInitializerContent = fs
    .readFileSync(`${pathToSwaggerUi}/swagger-initializer.js`)
    .toString()
    .replace(petstoreUrl, swaggerUrl)

  return res.type('text/javascript').send(swaggerInitializerContent)
}

/**
 * GET /_about
 * About page
 */
async function getAbout(req, res) {
  const paths = getPaths()

  const aboutData = {
    appName: packageFile.name,
    appVersion: packageFile.version,
    appDescription: packageFile.description,
    monitorUri: paths.system.monitor.uri,
    dockerVersion: version.dockerVersion,
    hostname: os.hostname(),
    started,
  }
  return res.json(aboutData)
}

/**
 * GET /_monitor
 * Monitor page
 */
async function getMonitor(req, res) {
  try {
    await monitorRequest(req, res, [
      {
        key: 'mongodb',
        required: true,
        db,
      },
      {
        key: 'agenda',
        required: false,
        agendaState: await Agenda.isStatusOkay(),
      },
    ])
  } catch (error) {
    log.error(`Monitor failed`, error)
    res.status(500).end()
  }
}

/**
 * GET /_paths
 * Return all paths for the system
 */
function getPathsHandler(req, res) {
  res.json(getPaths())
}

function getCheckAPIKey(req, res) {
  res.end()
}
/**
 * GET /_status
 * Status - dynamic status information about the application.
 */
async function getStatus(req, res) {
  const statusData = {
    appName: packageFile.name,
    appVersion: packageFile.version,
    hostname: os.hostname(),
    started,
    env: process.env.NODE_ENV,
    jobs: await Agenda.getLastRunJobs(),
  }
  if (req.headers.accept === 'application/json') {
    return res.json(statusData)
  }
  return res.send(JSON.stringify(statusData))
}
/**
 * System controller for functions such as about and monitor.
 * Avoid making changes here in sub-projects.
 */
module.exports = {
  monitor: getMonitor,
  about: getAbout,
  paths: getPathsHandler,
  checkAPIKey: getCheckAPIKey,
  swagger: getSwagger,
  swaggerUI: getSwaggerUI,
  status: getStatus,
}
