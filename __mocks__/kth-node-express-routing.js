// @ts-check

const mocks = {
  getPaths: jest.fn().mockImplementation(() => ({
    system: {
      monitor: {
        uri: '/_monitor',
      },
    },
  })),
}

module.exports = mocks
