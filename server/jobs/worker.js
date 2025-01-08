/* eslint-disable no-use-before-define */

'use strict'

const { Agenda } = require('@hokify/agenda')
const mongoose = require('mongoose')
const log = require('@kth/log')

const config = require('../configuration').server
const packageFile = require('../../package.json')
const jobs = require('./jobs')

const worker = { status: 'Startup', agenda: null, isStatusOkay, getLastRunJobs }

module.exports = worker

let agendaInitialized = false
let lastAgendaProbeTime = new Date()
let errorCount = 0

/**
 * Cancel all current agena jobs.
 */
async function _cancel() {
  try {
    const currentJobs = await worker.agenda.jobs()
    await Promise.all(currentJobs.map(job => worker.agenda.cancel({ name: job.attrs.name })))
    log.info(`AGENDA: Canceled ${currentJobs.length} jobs`)
  } catch (e) {
    log.debug('AGENDA: Could not cancel jobs')
  }
}

/**
 * Removes all jobs in the database without defined behaviors.
 */
async function _purge() {
  try {
    const res = await worker.agenda.purge()
    log.info(`AGENDA: Purged ${res} jobs`)
  } catch (e) {
    log.debug('AGENDA: Could not purge jobs')
  }
}

/**
 * Logs all current jobs.
 */
async function showCurrentSchedule() {
  const currentJobs = await worker.agenda.jobs()
  for (let i = 0; i < currentJobs.length; i += 1) {
    log.info(`AGENDA: ${currentJobs[i].attrs.name}: scheduled at ${currentJobs[i].attrs.nextRunAt} `)
  }
}

/**
 * Creates, configures and initiates a new Agenda client.
 */
async function initAgenda() {
  if (agendaNotInitialized()) {
    log.info('AGENDA: Initializing a new Agenda instance.')
    const { connectionString, databaseName } = config.mongodb
    const agenda = new Agenda({
      db: { address: connectionString, options: { dbName: databaseName } },
      sort: { nextRunAt: 1 },
      processEvery: '15 minutes',
    })

    const lockLifetime = 14400000 // 4 hours

    worker.agenda = agenda
    setAgendaIsFine()

    agenda.defaultLockLifetime(lockLifetime) // 4 hours
    agenda.maxConcurrency(1)

    agenda.define('import', jobs.import)

    agenda.on('ready', async () => {
      try {
        setAgendaIsFine()

        await _cancel() // cancel running jobs
        await _purge() // clear out old jobs

        log.info('AGENDA: ready, configuring jobs...')

        await agenda.every('00 20 06 * * *', 'import')
        await agenda.start()

        log.info('AGENDA: Agenda instance configured and running')
        worker.status = 'OK'
        await showCurrentSchedule()
      } catch (e) {
        setAgendaHadProblem()
        errorCount += 1
        worker.status = 'Error: ' + e.message
        log.fatal({ err: e }, 'AGENDA: error during setup')
      }
    })

    agenda.on('start', job => {
      setAgendaIsFine()
      log.info(`AGENDA: Agenda start event triggered. ${job.attrs.name} job started`)
    })

    agenda.on('complete', job => {
      setAgendaIsFine()
      log.info(`AGENDA: Agenda complete event triggered. ${job.attrs.name} job stopped`)
    })

    agenda.on('success', job => {
      setAgendaIsFine()
      log.info(`AGENDA: Agenda success event triggered. ${job.attrs.name} job successful`)
    })

    agenda.on('error', err => {
      setAgendaHadProblem()
      errorCount += 1
      worker.status = 'Error: ' + err.message
      log.fatal({ err }, `AGENDA: Agenda error event triggered. ${errorCount}`)
    })

    agenda.on('fail', (err, job) => {
      setAgendaIsFine() // Agenda is still working fine after a failure of a job
      log.error({ err }, `AGENDA: Agenda fail event triggered. ${job.attrs.name} job failed`)
    })

    errorCount = 0
    agendaInitialized = true
  } else {
    log.info('AGENDA: Agenda already initialized.')
    agendaInitialized = true
  }
}

/**
 * Initiates a new Agenda client on Mongoose open event.
 */
mongoose.connection.on('connected', () => {
  log.info('AGENDA: Trigger Agenda initialization on mongoDb connection event')
  initAgenda()
})

/**
 * Initiate or restart Agenda upon reconnection of MongoDb.
 */
mongoose.connection.on('reconnected', async () => {
  log.info('AGENDA: Trigger Agenda restart on mongoDb reconnect event')
  restartAgenda()
})

/**
 * Check if Agenda is not initialized.
 */
function agendaNotInitialized() {
  if (!worker.agenda || !agendaInitialized) {
    log.info('AGENDA: Agenda is not yet initialized, continuing.')
    return true
  }
  log.info('AGENDA: Agenda already initialized.')
  return false
}

/**
 * Restarting agenda
 */
async function restartAgenda() {
  log.info('AGENDA: Trying to restart agenda')

  try {
    if (agendaNotInitialized()) {
      await initAgenda()
      return
    }

    errorCount = 0

    await worker.agenda.stop()
    await worker.agenda.start()
    log.info('AGENDA: Agenda restarted')
  } catch (error) {
    log.error('AGENDA: Agenda probe error: Could not restart agenda')
  }
  await showCurrentSchedule()
}

function setAgendaIsFine() {
  worker.isFine = true
}

function setAgendaHadProblem() {
  worker.isFine = false
}

/**
 * Check if agenda status is ok once per hour
 */
async function isStatusOkay() {
  const currentProbeTime = new Date()
  currentProbeTime.setHours(new Date().getHours() - 1)

  log.debug('AGENDA: currentProbeTime: ', currentProbeTime)
  log.debug('AGENDA: lastAgendaProbeTime: ', lastAgendaProbeTime)
  if (lastAgendaProbeTime < currentProbeTime) {
    await showCurrentSchedule()
    await isAgendaOk()
  }

  return worker.isFine
}

/**
 * Check if agenda is responding by asking for its stored jobs.
 */
async function isAgendaOk() {
  try {
    // worker.agenda = undefined // force agenda to break for testing purpose.
    const agendaJobs = await worker.agenda.jobs()

    if (agendaJobs.length) {
      setAgendaIsFine()
      lastAgendaProbeTime = new Date()
      log.info('AGENDA: Agenda probe: Agenda is up and running, resetting lastAgendaProbeTime')
      return
    }

    log.error('AGENDA: Agenda probe error: No agenda jobs defined in ' + packageFile.name)
    setAgendaHadProblem()
    restartAgenda()
    return
  } catch (err) {
    log.error('AGENDA: Agenda probe error: Agenda is not responding in ' + packageFile.name, err)
    setAgendaHadProblem()
    restartAgenda()
  }
}

/**
 * Get jobs run the last 24h
 */
async function getLastRunJobs() {
  try {
    const lastRunJobs = await worker.agenda.jobs({
      lastRunAt: { $gt: new Date(new Date().setHours(new Date().getHours() - 24)) },
    })

    return lastRunJobs.map(job => ({
      name: job.attrs.name,
      type: job.attrs.type,
      lastRunAt: job.attrs.lastRunAt,
      lastFinishedAt: job.attrs.lastFinishedAt,
      nextRunAt: job.attrs.nextRunAt,
      failedAt: job.attrs.failedAt,
      failReason: job.attrs.failReason,
    }))
  } catch (err) {
    log.error('getLastRunJobs:  Agenda is not responding in ' + packageFile.name, err)
    return false
  }
}
