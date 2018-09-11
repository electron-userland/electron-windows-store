const path = require('path')
const mockery = require('mockery')

describe('Assets', () => {
  afterEach(() => mockery.deregisterAll())

  describe('assets()', () => {
    it('should attempt to copy assets if they have been passed', (done) => {
      const programMock = {
        assets: '/fakepath/to/assets',
        outputDirectory: '/fakepath/to/output'
      }
      const fsMock = {
        copy: function (source, destination, cb) {
          source.should.equal(path.normalize('/fakepath/to/assets'))
          destination.should.equal(path.normalize('/fakepath/to/output/pre-appx/Assets'))

          if (cb) {
            cb()
          } else {
            return Promise.resolve()
          }
        }
      }

      mockery.registerMock('fs-extra', fsMock)
      require('../../lib/assets')(programMock).should.be.fulfilled.and.notify(done)
      mockery.deregisterMock('fs-extra');
    })

    it('should resolve right away if no assets have been passed', (done) => {
      const programMock = {}
      require('../../lib/assets')(programMock).should.be.fulfilled.and.notify(done)
    })
  })
})
