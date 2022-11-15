// eslint-disable-next-line no-shadow
import { Request, Response, NextFunction } from 'express'

const config = require('./configuration').server

/**
 * Middleware to filter out swagger files
 */
const swaggerFilesRE = /(index|swagger-ui|favicon|swagger-initializer).*\.(css|js|png|html)/
function swaggerHandler(req: Request, res: Response, next: NextFunction) {
  if (
    req.originalUrl === config.proxyPrefixPath.uri + '/swagger' ||
    req.originalUrl === config.proxyPrefixPath.uri + '/swagger/'
  ) {
    // This redirect is needed since swagger js & css files to get right paths
    return res.redirect(config.proxyPrefixPath.uri + '/swagger/index.html')
  }

  if (req.originalUrl.indexOf('/swagger/') >= 0) {
    const requestedUrl = req.originalUrl.replace(`${config.proxyPrefixPath.uri}/swagger/`, '')

    if (swaggerFilesRE.test(requestedUrl)) {
      return next()
    }

    return res.status(404).json({ message: `Not found: ${req.originalUrl}` })
  }
  return next()
}

export = {
  swaggerHandler,
}
