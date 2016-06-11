'use strict'

const path = require('path')
const chalk = require('chalk')

const utils = require('./utils')

module.exports = function (program) {
  return new Promise((resolve, reject) => {
    // If we do a simple conversion, we don't need to zip.
    if (!program.containerVirtualization) {
      return resolve()
    }

    let input = program.inputDirectory
    let output = program.outputDirectory
    let args = `& {& '${path.resolve(__dirname, '..', 'ps1', 'zip.ps1')}' -source '${input}' -destination '${output}'}`

    utils.log(chalk.green('Zipping up built Electron application...'))

    return utils.executeChildProcess('powershell.exe', ['-NoProfile', '-NoLogo', args])
      .then(() => resolve())
      .catch((err) => reject(err))
  })
}
