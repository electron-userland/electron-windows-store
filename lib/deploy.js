'use strict'

const chalk = require('chalk')

const utils = require('./utils')

module.exports = function (program) {
  return new Promise((resolve, reject) => {
    if (!program.deploy) {
      return resolve()
    }

    utils.log(chalk.bold.green('Deploying package to system...'))

    let args = `& {& Add-AppxPackage '${program.outputDirectory}/${program.packageName}.appx'}`

    return utils.executeChildProcess('powershell.exe', ['-NoProfile', '-NoLogo', args])
      .then(() => resolve())
      .catch((err) => reject(err))
  })
}
