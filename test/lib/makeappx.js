'use strict'

const path = require('path')
const mockery = require('mockery')

const ChildProcessMock = require('../fixtures/child_process')

describe('MakeAppX', () => {
  const cpMock = {
    spawn(_process, _args) {
      passedProcess = _process
      passedArgs = _args

      return new ChildProcessMock()
    }
  }

  let passedArgs
  let passedProcess

  afterEach(() => {
    mockery.deregisterAll()
    passedArgs = undefined
    passedProcess = undefined
  })

  describe('makeappx()', () => {
    it('should attempt to call makeappx.exe for a pre-appx folder', function (done) {
      const programMock = {
        deploy: true,
        inputDirectory: '/fakepath/to/input',
        outputDirectory: '/fakepath/to/output',
        windowsKit: '/fakepath/to/windows/kit/bin',
        packageName: 'testapp'
      }

      mockery.registerMock('child_process', cpMock)

      require('../../lib/makeappx')(programMock)
        .then(() => {
          const expectedScript = path.join(programMock.windowsKit, 'makeappx.exe')
          const expectedOutput = path.join(programMock.outputDirectory, 'testapp.appx')
          const expectedInput = path.join(programMock.outputDirectory, 'pre-appx')
          const expectedParams = ['pack', '/d', expectedInput, '/p', expectedOutput, '/o']

          passedProcess.should.equal(expectedScript)
          passedArgs.should.deep.equal(expectedParams)
          done()
        })
    })

    it('should pass the /l flag if the pre-appx folder contains variable assets', function (done) {
      const programMock = {
        deploy: true,
        assets: path.join(__dirname, '..', 'fixtures', 'assets-scaled'),
        inputDirectory: '/fakepath/to/input',
        outputDirectory: '/fakepath/to/output',
        windowsKit: '/fakepath/to/windows/kit/bin',
        packageName: 'testapp'
      }

      mockery.registerMock('child_process', cpMock)

      require('../../lib/makeappx')(programMock)
        .then(() => {
          const expectedScript = path.join(programMock.windowsKit, 'makeappx.exe')
          const expectedOutput = path.join(programMock.outputDirectory, 'testapp.appx')
          const expectedInput = path.join(programMock.outputDirectory, 'pre-appx')
          const expectedParams = ['pack', '/d', expectedInput, '/p', expectedOutput, '/o', '/l']

          passedProcess.should.equal(expectedScript)
          passedArgs.should.deep.equal(expectedParams)
          done()
        })
    })

    it('should not pass the /l flag if the pre-appx folder does not contain variable assets', function (done) {
      const programMock = {
        deploy: true,
        assets: path.join(__dirname, '..', 'fixtures', 'assets'),
        inputDirectory: '/fakepath/to/input',
        outputDirectory: '/fakepath/to/output',
        windowsKit: '/fakepath/to/windows/kit/bin',
        packageName: 'testapp'
      }

      mockery.registerMock('child_process', cpMock)

      require('../../lib/makeappx')(programMock)
        .then(() => {
          const expectedScript = path.join(programMock.windowsKit, 'makeappx.exe')
          const expectedOutput = path.join(programMock.outputDirectory, 'testapp.appx')
          const expectedInput = path.join(programMock.outputDirectory, 'pre-appx')
          const expectedParams = ['pack', '/d', expectedInput, '/p', expectedOutput, '/o']

          passedProcess.should.equal(expectedScript)
          passedArgs.should.deep.equal(expectedParams)
          done()
        })
    })

    it('should reject right away if no Windows Kit is available', (done) => {
      const programMock = {}
      require('../../lib/makeappx')(programMock).should.be.rejected.notify(done)
    })
  })
})
