'use strict'

const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')
const utils = require('./utils')

module.exports = function (program) {
  if (!program.assets) {
    return Promise.resolve()
  }

  // Let's copy in the assets
  utils.log(chalk.bold.green('Copying visual assets into pre-appx folder...'))

  const source = path.normalize(program.assets)
  const destination = path.join(program.outputDirectory, 'pre-appx', 'Assets')

  utils.debug(`Copying visual assets from ${source} to ${destination}`)

  return fs.copy(source, destination)
    .catch(error => {
      utils.debug(`Copying visual assets failed: ${JSON.stringify(error)}`)
      throw error
    }).then(() => utils.debug('Copying visual assets succeeded'))
}
