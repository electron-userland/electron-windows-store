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

    fs.copy(source, destination, (err) => {
      if (err) {
        return reject(err)
      }

      resolve()
    })
  })
}
