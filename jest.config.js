module.exports = {
  preset: 'ts-jest',
  // For a detailed explanation regarding each configuration property, visit:
  // https://jestjs.io/docs/en/configuration.html

  // All imported modules in your tests should be mocked automatically
  // automock: true,

  // Stop running tests after the first failure
  bail: false,

  // The directory where Jest should store its cached dependency information
  // cacheDirectory: './tmp/jest_rs',

  // Automatically clear mock calls and instances between every test
  // clearMocks: false,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  // collectCoverageFrom: null,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: [
    '/node_modules/',
  ],

  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: [
    'json',
    'html'
  ],

  // An object that configures minimum threshold enforcement for coverage results
  // coverageThreshold: null,

  // Make calling deprecated APIs throw helpful error messages
  // errorOnDeprecated: false,

  // A path to a module which exports an async function that is triggered once before all test suites
  // globalSetup: null,

  // A path to a module which exports an async function that is triggered once after all test suites
  // globalTeardown: null,

  // A set of global variables that need to be available in all test environments
  globals: {
    'ts-jest': {

    }
  },

  // An array of directory names to be searched recursively up from the requiring module's location
  // moduleDirectories: [
  //   'node_modules'
  // ],

  // An array of file extensions your modules use
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],

  // A map from regular expressions to module names that allow to stub out resources with a single module
  // moduleNameMapper: {
  //   '(.*)$': '<rootDir>/src/types/$1'
  // },

  // Activates notifications for test results
  notify: true,

  // An enum that specifies notification mode. Requires { notify: true }
  notifyMode: 'always',

  // Use this configuration option to add custom reporters to Jest
  // reporters: undefined,

  reporters: [
    'default',
    ['./node_modules/jest-html-reporter', {
        pageTitle: 'Test Report'
    }]
  ],

  // Automatically reset mock state between every test
  // resetMocks: false,

  // Reset the module registry before running each individual test
  // resetModules: false,

  // Automatically restore mock state between every test
  // restoreMocks: false,

  // The root directory that Jest should scan for tests and modules within
  // rootDir: 'src',
  // A list of paths to directories that Jest should use to search for files in
  // roots: [
  //   '<rootDir>'
  // ],

  // The test environment that will be used for testing
  testEnvironment: 'node',

  // Options that will be passed to the testEnvironment
  // testEnvironmentOptions: {},
  testPathIgnorePatterns: [
    '/test/dummy/*',
    // '/test/index.ts'
  ],
  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/test/**/*.js?(x)',
    '**/test/**/*.ts?(x)',
  ],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  // testRegex: '(/test/.*|(\\.|/)(test|spec))\\.(js?|ts?)$',
  // The regexp pattern Jest uses to detect test files
  // testRegex: './test/.*.js$',

  // Indicates whether each individual test should be reported during the run
  verbose: true,

  // An array of regexp patterns that are matched against all source file paths before re-running tests in watch mode
  // watchPathIgnorePatterns: [],

  // Whether to use watchman for file crawling
  watchman: true
}
