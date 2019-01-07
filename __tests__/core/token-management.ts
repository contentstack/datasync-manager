import { writeFileSync } from 'fs'
import { sync as mkdirp } from 'mkdirp'
import { join, resolve } from 'path'
import { sync as rimraf } from 'rimraf'
import { setConfig } from '../../src'
import { getTokenByType } from '../../src/core/token-management'
import { stringify } from '../../src/util/stringify'
import { config } from '../dummy/config'

test('Get token by type should work without errors', () => {
  const tokenData = [
    {
      name: 'sync_token',
      timestamp: '2019-01-04T12:13:42.108Z',
      token: '***REMOVED***',
      type: 'checkpoint',
    },
  ]
  const configs: any = config
  configs.paths = {
    token: {
      ledger: resolve(join(__dirname, '..', '..', '.tokens', 'ledger')),
    },
  }
  setConfig(configs)
  const tokenDirectory = resolve(join(__dirname, '..', '..', '.tokens'))
  const ledgerPath = join(tokenDirectory, 'ledger')
  const err: any = new Error(`ENOENT: no such file or directory, open '${ledgerPath}'`)
  err.code = 'ENOENT'
  rimraf(tokenDirectory)
  mkdirp(tokenDirectory)
  writeFileSync(ledgerPath, stringify(tokenData))
  getTokenByType('checkpoint').then((tokenDetails) => {
    expect(tokenDetails).toMatchObject(tokenData[0])
  }).catch((error) => {
    expect(error).toEqual(err)
  })
  // expect(getTokenByType('checkpoint')).resolves.toMatchObject(tokenData[0])
})

test('Get token by type should throw error (path does not exist!)', () => {
  const configs: any = config
  configs.paths = {
    token: {
      ledger: resolve(join(__dirname, '..', '..', '.tokens', 'ledger')),
    },
  }
  setConfig(configs)
  const tokenDirectory = resolve(join(__dirname, '..', '..', '.tokens'))
  const ledgerPath = join(tokenDirectory, 'ledger')
  const err: any = new Error(`Token path ${ledgerPath} does not exist`)
  rimraf(tokenDirectory)

  return getTokenByType('checkpoint').then((result) => {
    expect(result).toBeUndefined()
  }).catch((error) => {
    expect(error).toEqual(err)
  })
})

test('Get token by type should throw error (path does not exist!)', () => {
  const configs: any = config
  configs.paths = {
    token: {
      ledger: resolve(join(__dirname, '..', '..', '.tokens', 'ledger')),
    },
  }
  setConfig(configs)
  const tokenDirectory = resolve(join(__dirname, '..', '..', '.tokens'))
  const ledgerPath = join(tokenDirectory, 'ledger')
  const err: any = new Error(`Token path ${ledgerPath} does not exist`)
  rimraf(tokenDirectory)
  mkdirp(tokenDirectory)

  return getTokenByType('checkpoint').then((result) => {
    expect(result).toBeUndefined()
  }).catch((error) => {
    expect(error).toEqual(err)
  })
})

// test('Get token by type should throw error (path does not exist!)', () => {
//   const configs: any = config
//   configs.paths = {
//     token: {
//       ledger: resolve(join(__dirname, '..', '..', '.tokens', 'ledger')),
//     },
//   }
//   setConfig(configs)
//   const tokenDirectory = resolve(join(__dirname, '..', '..', '.tokens'))
//   const ledgerPath = join(tokenDirectory, 'ledger')
//   const err: any = new Error(`Token path ${ledgerPath} does not exist`)
//   err.code = 'TNE'
//   rimraf.sync(tokenDirectory)

//   expect(getTokenByType('checkpoint')).rejects.toEqual(err)
// })
