'use strict'

const path = require('path')
const chalk = require('chalk')
const spawn = require('child_process').spawn

module.exports = function (inputDir, flatten) {
  return new Promise((resolve, reject) => {
    if (flatten === false) {
      return resolve()
    }

    console.log(chalk.bold.green('Flattening modules...'))

    let args = `& {& '${path.resolve(__dirname, '..', 'ps1', 'flattennpmmodules.ps1')}' -source '${inputDir}'}`
    let child

    try {
      child = spawn('powershell.exe', ['-NoProfile', '-NoLogo', args])
    } catch (error) {
      reject(error)
    }

    child.stdout.on('data', (data) => console.log(data.toString().replace(/(\n|\r)+$/, '')))
    child.stderr.on('data', (data) => console.log(data.toString()))

    child.on('exit', () => resolve())

    child.stdin.end()
  })
}
