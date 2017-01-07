'use strict'

const path = require('path')
const chalk = require('chalk')
const spawn = require('child_process').spawn

const utils = require('./utils')

module.exports = function (program) {
  return new Promise((resolve, reject) => {
    if (!program.flatten) {
      return resolve()
    }

    utils.log(chalk.bold.green('Flattening modules...'))

    let args = `& {& '${path.resolve(__dirname, '..', 'ps1', 'flattennpmmodules.ps1')}' -source '${program.inputDirectory}'}`
    let child

    try {
      child = spawn('powershell.exe', ['-NoProfile', '-NoLogo', args])
    } catch (error) {
      reject(error)
    }

    child.stdout.on('data', (data) => utils.debug(data.toString().replace(/(\n|\r)+$/, '')))
    child.stderr.on('data', (data) => utils.debug(data.toString()))

    child.on('exit', () => resolve())

    child.stdin.end()
  })
}
