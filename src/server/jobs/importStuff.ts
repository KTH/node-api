'use strict'

const log = require('@kth/log')

const cleanUp = async (when: number) => {
  log.info('cleanUp: removing old stuff')
}
/**
 * Start import of some stuff
 */
async function start() {
  const imported = Date.now()

  log.info(`import: start at ${imported} `)
  try {
    log.info(`Do some import`)
    await cleanUp(imported)
    log.info('import: done')
  } catch (err) {
    log.error(`FATAL IMPORT ERROR:  - `, { err })
    throw err
  }
}

export = {
  start,
}
