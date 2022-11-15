const log = require('@kth/log')
// eslint-disable-next-line no-shadow
import { Request, Response, NextFunction } from 'express'
/**
 * Sample API controller. Can safely be removed.
 */
// eslint-disable-next-line import/no-unresolved
import Sample from '../models/sample'

/**
 * @param {object} req
 * @param {object} res
 * @param {Function} next
 */
async function getData(req: Request, res: Response, next: NextFunction) {
  try {
    log.debug(`Enter getData ${req.params.id}`)
    let doc
    doc = await Sample.findById(req.params.id)

    if (!doc) {
      return res.status(404).json({ message: 'document not found' })
    }
    log.debug('Leave getData')
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
async function postData(req: Request, res: Response, next: NextFunction) {
  try {
    log.debug(`Enter postData ${req.params.id}`)
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
    log.debug(`Leave  postData`)
    res.json({ id: doc._id, name: doc.name })
  } catch (err) {
    next(err)
  }
}

export { getData, postData }
