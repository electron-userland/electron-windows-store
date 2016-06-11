'use strict'

const path = require('path')
const mockery = require('mockery')

const ChildProcessMock = require('../fixtures/child_process')

describe('Sign', () => {
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

  describe('signappx()', () => {
    it('should attempt to sign the current app', function (done) {
      const programMock = {
        inputDirectory: '/fakepath/to/input',
        outputDirectory: '/fakepath/to/output',
        windowsKit: '/fakepath/to/windows/kit/bin',
        packageName: 'testapp',
        devCert: 'fakepath/to/devcert.pfx'
      }

      mockery.registerMock('child_process', cpMock)

      require('../../lib/sign').signAppx(programMock)
        .then(() => {
          const expectedScript = path.join(programMock.windowsKit, 'signtool.exe')
          const expectedPfxFile = programMock.devCert
          const expectedAppx = path.join(programMock.outputDirectory, `${programMock.packageName}.appx`)
          const expectedParams = ['sign', '-f', expectedPfxFile, '-fd', 'SHA256', '-v', expectedAppx]

          passedProcess.should.equal(expectedScript)
          passedArgs.should.deep.equal(expectedParams)
          done()
        })
    })

    it('should reject if no certificate is present', function () {
      const programMock = {}
      return require('../../lib/sign').signAppx(programMock).should.be.rejected
    })
  })
})
