'use strict'

const path = require('path')
const utils = require('./utils')
const chalk = require('chalk')

function createConfig (program) {
  return new Promise((resolve, reject) => {
    if (!program.windowsKit) {
      return reject(new Error('Path to Windows Kit not specified'))
    }

    if (!program.makePri) {
      return resolve()
    }

    utils.log(chalk.bold.green('Creating priconfig...'))

    const makepri = path.join(program.windowsKit, 'makepri.exe')
    const source = path.join(program.outputDirectory, 'pre-appx', 'priconfig.xml')
    const params = ['createconfig', '/cf', source, '/dq', 'en-US'].concat(program.createConfigParams || [])
    const options = {cwd: path.join(program.outputDirectory, 'pre-appx')}

    utils.debug(`Using makepri.exe in: ${makepri}`)
    utils.debug(`Using pre-appx folder in: ${source}`)
    utils.debug(`Using parameters: ${JSON.stringify(params)}`)

    return utils.executeChildProcess(makepri, params, options)
      .then(() => resolve())
      .catch((err) => reject(err))
  })
}

function createPri (program) {
  return new Promise((resolve, reject) => {
    if (!program.windowsKit) {
      return reject(new Error('Path to Windows Kit not specified'))
    }

    if (!program.makePri) {
      return resolve()
    }

    utils.log(chalk.bold.green('Creating pri file...'))

    const makepri = path.join(program.windowsKit, 'makepri.exe')
    const source = path.join(program.outputDirectory, 'pre-appx', 'priconfig.xml')
    const destination = path.join(program.outputDirectory, 'pre-appx')
    const params = ['new', '/pr', destination, '/cf', source].concat(program.createPriParams || [])
    const options = {cwd: path.join(program.outputDirectory, 'pre-appx')}

    utils.debug(`Using makepri.exe in: ${makepri}`)
    utils.debug(`Using pre-appx folder in: ${source}`)
    utils.debug(`Using parameters: ${JSON.stringify(params)}`)

    return utils.executeChildProcess(makepri, params, options)
      .then(() => resolve())
      .catch((err) => reject(err))
  })
}

module.exports = function (program) {
  return createConfig(program).then(() => createPri(program))
}
