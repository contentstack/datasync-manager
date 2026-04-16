/* eslint-env jest */
// marked ships ESM; Jest/ts-jest need a stub for tests that load the app entry.
jest.mock('marked', () => ({
  __esModule: true,
  default: {
    parse: jest.fn(() => ''),
    setOptions: jest.fn(),
    use: jest.fn(),
  },
}))
