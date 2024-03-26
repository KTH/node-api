const log = require('@kth/log')
/**
 * Sample API controller. Can safely be removed.
 */
const { Sample } = require('../models')

/**
 * @param {object} req
 * @param {object} res
 * @param {Function} next
 */
async function getData(req, res, next) {
  try {
    log.debug({ req, res }, 'Enter getData')
    let doc = {}
    doc = await Sample.findById(req.params.id)

    if (!doc) {
      return res.status(404).json({ message: 'document not found' })
    }
    log.debug({ req, res }, 'Leave getData')
    return res.json({ id: doc._id, name: doc.name })
  } catch (err) {
    return next(err)
  }
}

/**
 * @param {object} req
 * @param {object} res
 * @param {Function} next
 */
async function postData(req, res, next) {
  try {
    log.debug({ req, res }, 'PostData')
    let doc = await Sample.findById(req.params.id)

    if (!doc) {
      doc = new Sample({
        _id: req.params.id,
        name: req.body.name,
      })
    } else {
      doc.name = req.body.name
    }

    await doc.save()
    log.debug({ req, res })
    res.json({ id: doc._id, name: doc.name })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getData,
  postData,
}
