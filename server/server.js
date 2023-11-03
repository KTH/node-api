/* eslint-disable import/order */
// But also try to get the order better
const express = require('express')

// Load .env file in development mode
const nodeEnv = process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase()
if (nodeEnv === 'development' || nodeEnv === 'dev' || !nodeEnv) {
  require('dotenv').config()
}

// Now read the server config etc.
const config = require('./configuration').server

/* ***********************
 * ******* LOGGING *******
 * ***********************
 */
const log = require('@kth/log')
const packageFile = require('../package.json')

const logConfiguration = {
  name: packageFile.name,
  level: config.logging.log.level,
}
log.init(logConfiguration)

const server = express()

const path = require('path')

const AppRouter = require('kth-node-express-routing').PageRouter
const { getPaths } = require('kth-node-express-routing')

// Expose the server and paths
server.locals.secret = new Map()
module.exports = server
module.exports.getPaths = () => getPaths()

/* ******************************
 * ******* ACCESS LOGGING *******
 * ******************************
 */
const accessLog = require('kth-node-access-log')

server.use(accessLog(config.logging.accessLog))

// QUESTION: Should this really be set here?
// http://expressjs.com/en/api.html#app.set
server.set('case sensitive routing', true)

/* *******************************
 * ******* REQUEST PARSING *******
 * *******************************
 */
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))
server.use(cookieParser())

/* ******************************
 * ******* AUTHENTICATION *******
 * ******************************
 */
const passport = require('passport')
require('./authentication')

/* ************************
 * ******* DATABASE *******
 * ************************
 */
require('./database').connect()

/* **********************************
 * ******* APPLICATION ROUTES *******
 * **********************************
 */
const { addPaths } = require('kth-node-express-routing')

const { createApiPaths, notFoundHandler, errorHandler } = require('kth-node-api-common')
const swaggerData = require('../swagger.json')
const { System } = require('./controllers')

const _addProxy = uri => `${config.proxyPrefixPath.uri}${uri}`

// System pages routes
const systemRoute = AppRouter()
systemRoute.get('system.monitor', _addProxy('/_monitor'), System.monitor)
systemRoute.get('system.about', _addProxy('/_about'), System.about)
systemRoute.get('system.paths', _addProxy('/_paths'), System.paths)
systemRoute.get('system.status', _addProxy('/_status'), System.status)
systemRoute.get('system.swagger', _addProxy('/swagger.json'), System.swagger)
systemRoute.get('system.swaggerUI', config.proxyPrefixPath.uri + '/swagger/swagger-initializer.js', System.swaggerUI)
server.use('/', systemRoute.getRouter())

// Swagger UI
const pathToSwaggerUi = require('swagger-ui-dist').absolutePath()

const swaggerUrl = _addProxy('/swagger')

const { swaggerHandler } = require('./swagger')

server.use(swaggerUrl, swaggerHandler)
server.use(swaggerUrl, express.static(pathToSwaggerUi))

// Add API endpoints defined in swagger to path definitions so we can use them to register API endpoint handlers
addPaths(
  'api',
  createApiPaths({
    swagger: swaggerData,
    proxyPrefixPathUri: config.proxyPrefixPath.uri,
  })
)

// Middleware to protect endpoints with apiKey
const authByApiKey = passport.authenticate('apikey', { session: false })

// Application specific API endpoints
const { Sample } = require('./controllers')
const { ApiRouter } = require('kth-node-express-routing')

const apiRoute = ApiRouter(authByApiKey)
const paths = getPaths()

// API endpoints
apiRoute.register(paths.api.checkAPIkey, System.checkAPIKey)
apiRoute.register(paths.api.getDataById, Sample.getData)
apiRoute.register(paths.api.postDataById, Sample.postData)
server.use('/', apiRoute.getRouter())

// Catch not found and errors
server.use(notFoundHandler)
server.use(errorHandler)

/* ****************************
 * ******* APP SPECIFIC *******
 * ****************************
 */
require('./jobs/worker')

module.exports = server
