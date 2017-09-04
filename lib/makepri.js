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
    const source = path.join('pre-appx', 'priconfig.xml')
    const params = ['createconfig', '/cf', source, '/dq', 'en-US'].concat(program.createConfigParams || [])
    const options = {cwd: program.outputDirectory}

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
    const source = path.join('pre-appx', 'priconfig.xml')
    const projectFolder = 'pre-appx'
    const outFile = path.join('pre-appx', 'resources.pri')
    const params = ['new', '/pr', projectFolder, '/cf', source, '/of', outFile].concat(program.createPriParams || [])
    const options = {cwd: program.outputDirectory}

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
