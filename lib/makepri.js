'use strict'

const path = require('path')
const utils = require('./utils')
const chalk = require('chalk')

function createConfig (program) {
  return new Promise((resolve, reject) => {
    if (!program.windowsKit) {
      return reject('Path to Windows Kit not specified')
    }

    if (!program.makePri) {
      return resolve()
    }

    utils.log(chalk.bold.green('Creating priconfig...'))

    let makepri = path.join(program.windowsKit, 'makepri.exe')
    let source = path.join(program.outputDirectory, 'pre-appx', 'priconfig.xml')
    let params = ['createconfig', '/cf', source, '/dq', 'en-US'].concat(program.createConfigParams || [])

    utils.debug(`Using makepri.exe in: ${makepri}`)
    utils.debug(`Using pre-appx folder in: ${source}`)
    utils.debug(`Using parameters: ${JSON.stringify(params)}`)

    return utils.executeChildProcess(makepri, params)
      .then(() => resolve())
      .catch((err) => reject(err))
  })
}

function createPri (program) {
  return new Promise((resolve, reject) => {
    if (!program.windowsKit) {
      return reject('Path to Windows Kit not specified')
    }

    if (!program.makePri) {
      return resolve()
    }

    utils.log(chalk.bold.green('Creating pri file...'))

    let makepri = path.join(program.windowsKit, 'makepri.exe')
    let source = path.join(program.outputDirectory, 'pre-appx', 'priconfig.xml')
    let destination = path.join(program.outputDirectory, 'pre-appx')
    let params = ['new', '/pr', destination, '/cf', source].concat(program.createPriParams || [])

    utils.debug(`Using makepri.exe in: ${makepri}`)
    utils.debug(`Using pre-appx folder in: ${source}`)
    utils.debug(`Using parameters: ${JSON.stringify(params)}`)

    return utils.executeChildProcess(makepri, params)
      .then(() => resolve())
      .catch((err) => reject(err))
  })
}

module.exports = function (program) {
  return createConfig(program).then(() => createPri(program))
}
