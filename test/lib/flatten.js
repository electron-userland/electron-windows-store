'use strict'

const path = require('path')
const mockery = require('mockery')
const ChildProcessMock = require('../fixtures/child_process')

describe('Flatten', () => {
  afterEach(() => mockery.deregisterAll())

  describe('flatten()', () => {
    it('should attempt to flatten the app directory', function (done) {
      let passedProcess
      let passedArgs

      const programMock = {
        deploy: true,
        inputDirectory: '/fakepath/to/input',
        outputDirectory: '/fakepath/to/output',
        flatten: true
      }
      const cpMock = {
        spawn(_process, _args) {
          passedProcess = _process
          passedArgs = _args

          return new ChildProcessMock()
        }
      }

      mockery.registerMock('child_process', cpMock)

      require('../../lib/flatten')(programMock)
        .then(() => {
          const expectedScript = path.resolve(__dirname, '..', '..', 'ps1', 'flattennpmmodules.ps1')
          
          passedProcess.should.equal('powershell.exe')
          passedArgs[2].should.equal(`& {& '${expectedScript}' -source '${programMock.inputDirectory}'}`)
          done()
        })
    })

    it('should resolve right away if no flattening was requested', (done) => {
      const programMock = {}
      require('../../lib/flatten')(programMock).should.be.fulfilled.notify(done)
    })
  })
})
