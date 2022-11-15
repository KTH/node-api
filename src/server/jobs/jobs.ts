'use strict'

const log = require('@kth/log')
const { importStuff } = require('./importStuff')

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return String(error)
}
interface AgendaJob {
  fail: (e?: Error) => void
  save: () => void
}
const importJob = async (job: AgendaJob, done: (e?: Error) => void) => {
  try {
    await importStuff.start()
    done()
  } catch (e) {
    log.error({ err: e }, 'import failure:', getErrorMessage(e))
    job.fail(new Error(getErrorMessage(e)))
    await job.save()
    done()
  }
}

export = {
  import: importJob,
}
