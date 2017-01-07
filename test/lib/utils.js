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

    it('should return the correct location for the default windows kit locataion (x86)', () => {
      return utils.getDefaultWindowsKitLocation('ia32').should.equal('C:\\Program Files (x86)\\Windows Kits\\10\\bin\\x86')
    })

    it('should return the correct location for the default windows kit locataion (x64)', () => {
      return utils.getDefaultWindowsKitLocation('x64').should.equal('C:\\Program Files (x86)\\Windows Kits\\10\\bin\\x64')
    })

    it('should return the correct location for the default windows kit locataion (default)', () => {
      const x86 = 'C:\\Program Files (x86)\\Windows Kits\\10\\bin\\x86'
      const x64 = 'C:\\Program Files (x86)\\Windows Kits\\10\\bin\\x64'

      if (process.arch === 'ia32') {
        return utils.getDefaultWindowsKitLocation().should.equal(x86)
      } else {
        return utils.getDefaultWindowsKitLocation().should.equal(x64)
      }
    })
  })
})
