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

/**
 * Adds a zero (0) to numbers less then ten (10)
 */
function zeroPad(value) {
  return value < 10 ? '0' + value : value
}

/**
 * Takes a Date object and returns a simple date string.
 */
function _simpleDate(date) {
  const year = date.getFullYear()
  const month = zeroPad(date.getMonth() + 1)
  const day = zeroPad(date.getDate())
  const hours = zeroPad(date.getHours())
  const minutes = zeroPad(date.getMinutes())
  const seconds = zeroPad(date.getSeconds())
  const hoursBeforeGMT = date.getTimezoneOffset() / -60
  const timezone = [' GMT', ' CET', ' CEST'][hoursBeforeGMT] || ''
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}${timezone}`
}

const started = _simpleDate(new Date())

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
    robotsUri: paths.system.robots.uri,
    gitBranch: JSON.stringify(version.gitBranch),
    gitCommit: JSON.stringify(version.gitCommit),
    jenkinsBuild: JSON.stringify(version.jenkinsBuild),
    jenkinsBuildDate: version.jenkinsBuild
      ? _simpleDate(new Date(parseInt(version.jenkinsBuild, 10) * 1000))
      : JSON.stringify(version.jenkinsBuildDate),
    dockerName: JSON.stringify(version.dockerName),
    dockerVersion: JSON.stringify(version.dockerVersion),
    hostname: os.hostname(),
    started,
    env: process.env.NODE_ENV,
  }
  if (req.headers.accept === 'application/json') {
    return res.json(aboutData)
  }
  res.render('system/about', {
    layout: '',
    ...aboutData,
  })
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
 * GET /robots.txt
 * Robots.txt page
 */
function getRobotsTxt(req, res) {
  res.type('text').render('system/robots', {
    layout: '',
  })
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
  robotsTxt: getRobotsTxt,
  paths: getPathsHandler,
  checkAPIKey: getCheckAPIKey,
  swagger: getSwagger,
  swaggerUI: getSwaggerUI,
  status: getStatus,
}
