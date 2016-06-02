'use strict'

const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')

module.exports = function (program) {
  return new Promise((resolve, reject) => {
    if (!program.manifest) {
      return resolve()
    }

    // Let's copy in the new manifest
    console.log(chalk.bold.green('Overwriting manifest...'))

    const manifestPath = path.join(program.outputDirectory, 'pre-appx', 'AppxManifest.xml')
    fs.copy(program.manifest, manifestPath, (err) => {
      if (err) {
        return reject(err)
      }

      resolve()
    })
  })
}
