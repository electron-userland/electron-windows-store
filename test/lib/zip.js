'use strict'

const path = require('path')
const mockery = require('mockery')
const should = require('chai').should()

const ChildProcessMock = require('../fixtures/child_process')

describe('Zip', () => {
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
    it('should attempt to sign the current app', (done) => {
      const programMock = {
        inputDirectory: '/fakepath/to/input',
        outputDirectory: '/fakepath/to/output',
        containerVirtualization: true
      }

      mockery.registerMock('child_process', cpMock)

      require('../../lib/zip')(programMock).should.be.fulfilled
        .then(() => {
          const expectedInput = programMock.inputDirectory
          const expectedOutput = programMock.outputDirectory
          const expectedScript = path.resolve(__dirname, '..', '..', 'ps1', 'zip.ps1')
          const expectedPsArgs = `& {& '${expectedScript}' -source '${expectedInput}' -destination '${expectedOutput}'}`
          const expectedArgs = ['-NoProfile', '-NoLogo', expectedPsArgs]

          passedProcess.should.equal('powershell.exe')
          passedArgs.should.deep.equal(expectedArgs)
        })
        .should.notify(done)
    })

    it('does not zip if using simple (non-container) conversion', done => {
      const programMock = {}
      require('../../lib/zip')(programMock).should.be.fulfilled
        .then(() => {
          should.not.exist(passedArgs)
          should.not.exist(passedProcess)
        })
        .should.notify(done)
    })
  })
})
