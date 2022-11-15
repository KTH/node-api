const { getData, postData } = require('./sampleCtrl')

import { buildReq, buildRes, buildNext } from '../utils/testUtils'

jest.mock('@kth/log', () => ({
  init: jest.fn(() => {}),
  info: jest.fn(() => {}),
  debug: jest.fn(() => {}),
  error: jest.fn(() => {}),
}))

jest.mock('../models/sample', () => ({
  findById: jest.fn().mockImplementation(async _id => {
    if (!_id || _id === 'abc') {
      return null
    }
    if (_id === 'fail') {
      return {
        _id,
        name: 'mockdata',
        save: jest.fn().mockImplementation(async () => {
          throw new Error('Failed to save')
        }),
      }
    }
    return {
      _id,
      name: 'mockdata',
      save: jest.fn().mockImplementation(async () => {}),
    }
  }),
}))

describe(`Sample controller`, () => {
  beforeEach(() => {})
  afterEach(() => {})

  test('should getData ok', async () => {
    const req = buildReq({ params: { id: '123' } })
    const res = buildRes()
    const next = buildNext()

    await getData(req, res, next)

    expect(res.json).toHaveBeenNthCalledWith(1, { id: '123', name: 'mockdata' })
  })

  test('should handle getData not found', async () => {
    const req = buildReq({})
    const res = buildRes()
    const next = buildNext()

    await getData(req, res, next)

    expect(res.json).toHaveBeenNthCalledWith(1, { message: 'document not found' })
  })

  test('should postData update ok', async () => {
    const req = buildReq({ params: { id: '123' }, body: { name: 'foo' } })
    const res = buildRes()
    const next = buildNext()

    await postData(req, res, next)
    expect(res.json).toHaveBeenNthCalledWith(1, { id: '123', name: 'foo' })
  })
  test('should postData create ok', async () => {
    const req = buildReq({ params: { id: '123' }, body: { name: 'foo' } })
    const res = buildRes()
    const next = buildNext()

    await postData(req, res, next)
    expect(res.json).toHaveBeenNthCalledWith(1, { id: '123', name: 'foo' })
  })

  test('should handle postData  fail', async () => {
    const req = buildReq({ params: { id: 'fail' }, body: { name: 'foo' } })
    const res = buildRes()
    const next = buildNext()
    await postData(req, res, next)

    expect(next).toHaveBeenNthCalledWith(1, new Error('Failed to save'))
  })
})
