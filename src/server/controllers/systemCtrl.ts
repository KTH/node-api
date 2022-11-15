'use strict'

// eslint-disable-next-line no-shadow
const os = require('os')
const fs = require('fs')
// eslint-disable-next-line no-shadow
import { NextFunction, Request, Response } from 'express'

const version = require('../../config/version')

const log = require('@kth/log')
const db = require('@kth/mongo')
const { getPaths } = require('kth-node-express-routing')
const monitorSystems = require('@kth/monitor')
const configServer = require('../configuration').server
const packageFile = require('../../../package.json')

import { isStatusOkay, getLastRunJobs } from '../jobs/worker'
/**
 * Adds a zero (0) to numbers less then ten (10)
 */
function zeroPad(value: number) {
  return value.toString(10).padStart(2, '0')
  // return value < 10 ? '0' + value : value
}

/**
 * Takes a Date object and returns a simple date string.
 */
function _simpleDate(date: Date) {
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
function getSwagger(req: Request, res: Response) {
  res.json(require('../../../swagger.json'))
}

/**
 * GET /swagger
 * Swagger
 */
function getSwaggerUI(req: Request, res: Response) {
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
async function getAbout(req: Request, res: Response) {
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
async function getMonitor(req: Request, res: Response) {
  try {
    await monitorSystems(req, res, [
      {
        key: 'mongodb',
        required: true,
        db,
      },
      {
        key: 'agenda',
        required: false,
        agendaState: await isStatusOkay(),
      },

      {
        key: 'local',
        isResolved: true,
        message: '- local system checks: OK',
        statusCode: 200,
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
function getRobotsTxt(req: Request, res: Response) {
  res.type('text').render('system/robots', {
    layout: '',
  })
}

/**
 * GET /_paths
 * Return all paths for the system
 */
function getPathsHandler(req: Request, res: Response) {
  res.json(getPaths())
}

function getCheckAPIKey(req: Request, res: Response) {
  res.end()
}
/**
 * GET /_status
 * Status - dynamic status information about the application.
 */
async function getStatus(req: Request, res: Response) {
  const statusData = {
    appName: packageFile.name,
    appVersion: packageFile.version,
    hostname: os.hostname(),
    started,
    env: process.env.NODE_ENV,
    jobs: await getLastRunJobs(),
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
export = {
  monitor: getMonitor,
  about: getAbout,
  robotsTxt: getRobotsTxt,
  paths: getPathsHandler,
  checkAPIKey: getCheckAPIKey,
  swagger: getSwagger,
  swaggerUI: getSwaggerUI,
  status: getStatus,
}
