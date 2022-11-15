import { NextFunction } from 'express'
/*
 * utility functions
 */
export function buildReq(overrides?: any) {
  const req = { headers: { accept: 'application/json' }, body: {}, params: {}, ...overrides }
  return req
}

interface IResponse {
  json: () => IResponse
  status: () => IResponse
  type: () => IResponse
  send: () => IResponse
  render: () => IResponse
  end: () => IResponse
}

export function buildRes(overrides?: any) {
  const res: IResponse = {
    json: jest.fn(() => res).mockName('json'),
    status: jest.fn(() => res).mockName('status'),
    type: jest.fn(() => res).mockName('type'),
    send: jest.fn(() => res).mockName('send'),
    render: jest.fn(() => res).mockName('render'),
    end: jest.fn(() => res).mockName('end'),
    ...overrides,
  }
  return res
}

export function buildNext(impl?: NextFunction) {
  return jest.fn(impl).mockName('next')
}
