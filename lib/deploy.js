'use strict'

const chalk = require('chalk')

const utils = require('./utils')

module.exports = function (program) {
  if (!program.deploy) {
    return Promise.resolve()
  }

  utils.log(chalk.bold.green('Deploying package to system...'))

  let args = `& {& Add-AppxPackage '${program.outputDirectory}/${program.packageName}.appx'}`

  return utils.executeChildProcess('powershell.exe', ['-NoProfile', '-NoLogo', args])
}
