const utils = require('../../lib/utils')
const path = require('path')

describe('Utilities', () => {
  describe('hasVariableResources()', () => {
    it('should return true if files contain scale- indication', () => {
      return utils.hasVariableResources(path.join(__dirname, '..', 'fixtures', 'assets-scaled')).should.equal(true)
    })

    it('should return false if files do not contain scale- indication', () => {
      return utils.hasVariableResources(path.join(__dirname, '..', 'fixtures', 'assets')).should.equal(false)
    })
  })
})
