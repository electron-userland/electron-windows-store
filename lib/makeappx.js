'use strict'

const path = require('path')
const spawn = require('child_process').spawn
const utils = require('./utils')

module.exports = function (program) {
  return new Promise((resolve, reject) => {
    if (!program.windowsKit) {
      return reject()
    }

    let makeappx = path.join(program.windowsKit, 'makeappx.exe')
    let source = path.join(program.outputDirectory, 'pre-appx')
    let destination = path.join(program.outputDirectory, `${program.packageName}.appx`)
    let params = ['pack', '/d', source, '/p', destination].concat(program.makeappxParams || [])
    let child

    if (program.assets) {
      let assetPath = path.normalize(program.assets)

      if (utils.hasVariableResources(assetPath)) {
        params.push('/l')
      }
    }

    try {
      child = spawn(makeappx, params)
    } catch (error) {
      reject(error)
    }

    child.stdout.on('data', (data) => console.log(data.toString()))
    child.stderr.on('data', (data) => console.log(data.toString()))

    child.on('exit', () => resolve())

    child.stdin.end()
  })
}
