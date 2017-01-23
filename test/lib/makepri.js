'use strict'

const path = require('path')
const mockery = require('mockery')

const ChildProcessMock = require('../fixtures/child_process')

describe('Makepri', () => {
  let spawnedProcesses = []

  const cpMock = {
    spawn(_process, _args) {
      spawnedProcesses.push({
        passedProcess: _process,
        passedArgs: _args
      })

      return new ChildProcessMock()
    }
  }

  afterEach(() => {
    mockery.deregisterAll()
    spawnedProcesses = []
  })

  describe('makepri()', () => {
    it('should attempt to call makepri.exe with createconfig as parameter', function (done) {
      const programMock = {
        deploy: true,
        inputDirectory: '/fakepath/to/input',
        outputDirectory: '/fakepath/to/output',
        windowsKit: '/fakepath/to/windows/kit/bin',
        packageName: 'testapp',
        flatten: true
      }

      mockery.registerMock('child_process', cpMock)

      require('../../lib/makepri')(programMock)
        .then(() => {
          const exptectedTarget = path.join(programMock.outputDirectory, 'pre-appx', 'priconfig.xml')
          const expectedScript = path.join(programMock.windowsKit, 'makepri.exe')
          const expectedParams = ['createconfig', '/cf', exptectedTarget, '/dq', 'en-US']

          spawnedProcesses[0].passedProcess.should.equal(expectedScript)
          spawnedProcesses[0].passedArgs.should.deep.equal(expectedParams)
          done()
        })
    })

    it('should attempt to call makepri.exe with new as parameter', function (done) {
      const programMock = {
        deploy: true,
        inputDirectory: '/fakepath/to/input',
        outputDirectory: '/fakepath/to/output',
        windowsKit: '/fakepath/to/windows/kit/bin',
        packageName: 'testapp',
        flatten: true
      }

      mockery.registerMock('child_process', cpMock)

      require('../../lib/makepri')(programMock)
        .then(() => {
          const expectedOutput = path.join(programMock.outputDirectory, 'pre-appx')
          const exptectedTarget = path.join(programMock.outputDirectory, 'pre-appx', 'priconfig.xml')
          const expectedScript = path.join(programMock.windowsKit, 'makepri.exe')
          const expectedParams = ['new', '/pr', expectedOutput, '/cf', exptectedTarget]

          spawnedProcesses[1].passedProcess.should.equal(expectedScript)
          spawnedProcesses[1].passedArgs.should.deep.equal(expectedParams)
          done()
        })
    })

    it('should reject right away if no Windows Kit is available', (done) => {
      const programMock = {}
      require('../../lib/makepri')(programMock).should.be.rejected.notify(done)
    })
  })
})
