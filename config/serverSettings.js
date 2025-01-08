/**
 *
 *            Server specific settings
 *
 * *************************************************
 * * WARNING! Secrets should be read from env-vars *
 * *************************************************
 *
 */
const { getEnv, unpackApiKeysConfig, devDefaults } = require('kth-node-configuration')

// DEFAULT SETTINGS used for dev, if you want to override these for you local environment, use env-vars in .env
const devPrefixPath = devDefaults('/api/node')
const devSsl = devDefaults(false)
const devPort = devDefaults(3001)
const devMongodb = devDefaults('mongodb://127.0.0.1:27017/node')

// EXAMPLE: const devApiKeys = devDefaults('?name=devClient&apiKey=SET_YOUR_API_KEY&scope=write&scope=read')
const devApiKeys = devDefaults('?name=devClient&apiKey=1234&scope=write&scope=read')

// END DEFAULT SETTINGS

module.exports = {
  // The proxy prefix path if the application is proxied. E.g /places
  proxyPrefixPath: {
    uri: getEnv('SERVICE_PUBLISH', devPrefixPath),
  },
  port: getEnv('SERVER_PORT', devPort),

  // API keys
  api_keys: unpackApiKeysConfig('API_KEYS', devApiKeys),

  // Services
  mongodb: {
    connectionString: getEnv('MONGODB_URI', devMongodb),
    databaseName: getEnv('DATABASE_NAME'),
  },

  // Logging
  logging: {
    log: {
      level: getEnv('LOGGING_LEVEL', 'debug'),
    },
    accessLog: {
      useAccessLog: String(getEnv('LOGGING_ACCESS_LOG', true)).toLowerCase() === 'true',
    },
  },

  // Custom app settings
}
