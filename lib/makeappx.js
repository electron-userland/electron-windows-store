'use strict'

const path = require('path')
const utils = require('./utils')
const chalk = require('chalk')

module.exports = function (program) {
  return new Promise((resolve, reject) => {
    if (!program.windowsKit) {
      return reject(new Error('Path to Windows Kit not specified'))
    }

    utils.log(chalk.bold.green('Creating appx package...'))

    let makeappx = path.join(program.windowsKit, 'makeappx.exe')
    let source = path.join(program.outputDirectory, 'pre-appx')
    let destination = path.join(program.outputDirectory, `${program.packageName}.appx`)
    let params = ['pack', '/d', source, '/p', destination, '/o'].concat(program.makeappxParams || [])

    utils.debug(`Using makeappx.exe in: ${makeappx}`)
    utils.debug(`Using pre-appx folder in: ${source}`)
    utils.debug(`Using following destination: ${destination}`)
    utils.debug(`Using parameters: ${JSON.stringify(params)}`)

    if (program.assets) {
      let assetPath = path.normalize(program.assets)

      if (utils.hasVariableResources(assetPath)) {
        utils.debug(`Determined that package has variable resources, calling makeappx.exe with /l`)
        params.push('/l')
      }
    }

    return utils.executeChildProcess(makeappx, params)
      .then(() => resolve())
      .catch((err) => reject(err))
  })
}
