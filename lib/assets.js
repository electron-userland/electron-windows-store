'use strict'

const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')
const utils = require('./utils')

module.exports = function (program) {
  return new Promise((resolve, reject) => {
    if (!program.assets) {
      return resolve()
    }

    // Let's copy in the assets
    utils.log(chalk.bold.green('Copying visual assets into pre-appx folder...'))

    const source = path.normalize(program.assets)
    const destination = path.join(program.outputDirectory, 'pre-appx', 'Assets')

    utils.debug(`Copying visual assets from ${source} to ${destination}`)

    fs.copy(source, destination, (err) => {
      if (err) {
        utils.debug(`Copying visual assets failed: ${JSON.stringify(err)}`)
        return reject(err)
      }

      utils.debug('Copying visual assets succeeded')
      resolve()
    })
  })
}
