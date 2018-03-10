'use strict'

const path = require('path')
const fs = require('fs-extra')
const utils = require('./utils')
const chalk = require('chalk')

module.exports = async function makeAppx(program) {
  if (!program.windowsKit) {
    throw new Error('Path to Windows Kit not specified')
  }

  utils.log(chalk.bold.green('Creating appx package...'))

  let makeappx = path.join(program.windowsKit, 'makeappx.exe')

  if (program.bundleFromCwd) {
    var source = program.inputDirectory
  } else {
    var source = path.join(program.outputDirectory, 'pre-appx')
  }

  let params = ['pack', '/d', source, '/p', program.appx, '/o'].concat(program.makeappxParams || [])

  utils.debug(`Using makeappx.exe in: ${makeappx}`)
  utils.debug(`Using pre-appx folder in: ${source}`)
  utils.debug(`Using following destination: ${program.appx}`)
  utils.debug(`Using parameters: ${JSON.stringify(params)}`)

  if (program.assets) {
    let assetPath = path.normalize(program.assets)
    if (utils.hasVariableResources(assetPath)) {
      utils.debug(`Determined that package has variable resources, calling makeappx.exe with /l`)
      params.push('/l')
    }
  }

  await fs.ensureDir(path.dirname(program.appx))

  return utils.executeChildProcess(makeappx, params)
}
