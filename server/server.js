/* eslint-disable import/order */

const server = require('kth-node-server')
const path = require('path')

// Load .env file in development mode
const nodeEnv = process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase()
if (nodeEnv === 'development' || nodeEnv === 'dev' || !nodeEnv) {
  require('dotenv').config()
}

// Now read the server config etc.
const config = require('./configuration').server
const AppRouter = require('kth-node-express-routing').PageRouter
const { getPaths } = require('kth-node-express-routing')

// Expose the server and paths
server.locals.secret = new Map()
module.exports = server
module.exports.getPaths = () => getPaths()

/* ***********************
 * ******* LOGGING *******
 * ***********************
 */
const log = require('kth-node-log')
const packageFile = require('../package.json')

const logConfiguration = {
  name: packageFile.name,
  app: packageFile.name,
  env: process.env.NODE_ENV,
  level: config.logging.log.level,
  console: config.logging.console,
  stdout: config.logging.stdout,
  src: config.logging.src,
}
log.init(logConfiguration)

/* **************************
 * ******* TEMPLATING *******
 * **************************
 */
const exphbs = require('express-handlebars')

server.set('views', path.join(__dirname, '/views'))
server.engine('handlebars', exphbs())
server.set('view engine', 'handlebars')

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

server.use(passport.initialize())
server.use(passport.session())

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

const { createApiPaths, createSwaggerRedirectHandler, notFoundHandler, errorHandler } = require('kth-node-api-common')
const swaggerData = require('../swagger.json')
const { System } = require('./controllers')

const _addProxy = uri => `${config.proxyPrefixPath.uri}${uri}`

// System pages routes
const systemRoute = AppRouter()
systemRoute.get('system.monitor', _addProxy('/_monitor'), System.monitor)
systemRoute.get('system.about', _addProxy('/_about'), System.about)
systemRoute.get('system.paths', _addProxy('/_paths'), System.paths)
systemRoute.get('system.swagger', _addProxy('/swagger.json'), System.swagger)
systemRoute.get('system.robots', '/robots.txt', System.robotsTxt)
server.use('/', systemRoute.getRouter())

// Swagger UI
const express = require('express')
const pathToSwaggerUi = require('swagger-ui-dist').absolutePath()

server.use(
  _addProxy('/swagger'),
  createSwaggerRedirectHandler(`${_addProxy('/swagger')}?url=${_addProxy('/swagger.json')}`),
  express.static(pathToSwaggerUi)
)

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

module.exports = server
