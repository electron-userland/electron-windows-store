'use strict'

const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')

const utils = require('./utils')

module.exports = function (program) {
  return new Promise((resolve, reject) => {
    if (!program.manifest) {
      return resolve()
    }

    // Let's copy in the new manifest
    utils.log(chalk.bold.green('Overwriting manifest...'))

    const source = path.normalize(program.manifest)
    const destination = path.join(program.outputDirectory, 'pre-appx', 'AppXManifest.xml')

    utils.debug(`Copying manifest from ${source} to ${destination}`)

    fs.copy(source, destination, (err) => {
      if (err) {
        utils.debug(`Could not overwrite manifest. Error: ${JSON.stringify(err)}`)
        return reject(err)
      }

      resolve()
    })
  })
}
