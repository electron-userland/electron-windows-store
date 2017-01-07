'use strict'

const path = require('path')
const utils = require('./utils')
const chalk = require('chalk')

module.exports = function (program) {
  return new Promise((resolve, reject) => {
    if (!program.windowsKit) {
      return reject('Path to Windows Kit not specified')
    }

    utils.log(chalk.bold.green('Creating appx package...'))

    let makeappx = path.join(program.windowsKit, 'makeappx.exe')
    let source = path.join(program.outputDirectory, 'pre-appx')
    let destination = path.join(program.outputDirectory, `${program.packageName}.appx`)
    let params = ['pack', '/d', source, '/p', destination, '/o'].concat(program.makeappxParams || [])

    if (program.assets) {
      let assetPath = path.normalize(program.assets)

      if (utils.hasVariableResources(assetPath)) {
        params.push('/l')
      }
    }

    return utils.executeChildProcess(makeappx, params)
      .then(() => resolve())
      .catch((err) => reject(err))
  })
}
