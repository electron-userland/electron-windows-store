'use strict'

const path = require('path')
const mockery = require('mockery')
const ChildProcessMock = require('../fixtures/child_process')

describe('Deploy', () => {
  afterEach(() => mockery.deregisterAll())

  describe('deploy()', () => {
    it('should attempt to deploy the app if requested', function (done) {
      let passedProcess
      let passedArgs

      const programMock = {
        deploy: true,
        outputDirectory: '/fakepath/to/output',
        packageName: 'testApp'
      }
      const cpMock = {
        spawn(_process, _args) {
          passedProcess = _process
          passedArgs = _args

          return new ChildProcessMock()
        }
      }

      mockery.registerMock('child_process', cpMock)

      require('../../lib/deploy')(programMock)
        .then(() => {
          passedProcess.should.equal('powershell.exe')
          passedArgs[2].should.equal(`& {& Add-AppxPackage '${programMock.outputDirectory}/${programMock.packageName}.appx'}`)
          done()
        })
    })

    it('should resolve right away if no deployment was requested', (done) => {
      const programMock = {}
      require('../../lib/deploy')(programMock).should.be.fulfilled.notify(done)
    })
  })
})
