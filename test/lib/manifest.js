const path = require('path')
const mockery = require('mockery')

describe('Manifest', () => {
  afterEach(() => mockery.deregisterAll())

  describe('manifest()', () => {
    it('should attempt to copy a manifest if it has been passed', () => {
      const programMock = {
        outputDirectory: '/fakepath/to/output',
        manifest: '/fakepath/to/manifest'
      }
      const fsMock = {
        copy: function (source, destination, cb) {
          const expectedSource = path.normalize(programMock.manifest)
          const expectedDestination = path.join(programMock.outputDirectory, 'pre-appx', 'AppXManifest.xml')

          source.should.equal(expectedSource)
          destination.should.equal(expectedDestination)

          if (cb) {
            cb()
          } else {
            return Promise.resolve()
          }
        }
      }

      mockery.registerMock('fs-extra', fsMock)
      return require('../../lib/manifest')(programMock).should.be.fulfilled
    })

    it('should resolve right away if no manifest was passed', () => {
      const programMock = {}
      return require('../../lib/manifest')(programMock).should.be.fulfilled
    })
  })
})
