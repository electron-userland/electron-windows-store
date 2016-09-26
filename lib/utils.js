'use strict'

/**
 * Ensures that the currently running platform is Windows,
 * exiting the process if it is not
 */
function ensureWindows () {
  if (process.platform !== 'win32') {
    log('This tool requires Windows 10.\n')
    log('You can run a virtual machine using the free VirtualBox and')
    log('the free Windows Virtual Machines found at http://modern.ie.\n')
    log('For more information, please see the readme.')
    process.exit(1)
  }

  let release = require('os').release()
  let major = parseInt(release.slice(0, 2), 10)
  let minor = parseInt(release.slice(3, 4), 10)
  let build = parseInt(release.slice(5), 10)

  if (major < 10 || (minor === 0 && build < 14316)) {
    log(`You are running Windows ${release}. You need at least Windows 10.0.14316.`)
    log('We can\'t confirm that you\'re running the right version, but we won\'t stop')
    log('this process - should things fail though, you might have to update your')
    log('Windows.')
  }
}

/**
 * Makes an educated guess whether or not resources have
 * multiple variations or resource versions for
 * language, scale, contrast, etc
 *
 * @param assetsDirectory - Path to a the assets directory
 * @returns {boolean} - Are the assets variable?
 */
function hasVariableResources (assetsDirectory) {
  const files = require('fs-extra').readdirSync(assetsDirectory)
  const hasScale = files.find(file => /\.scale-...\./g.test(file))

  return (!!hasScale)
}

/**
 * Tests a given directory for existence
 *
 * @param directory - Path to a directory
 * @returns {boolean} - Does the dir exist?
 */
function isDirectory (directory) {
  return require('path-exists').sync(directory)
}

/**
 * Starts a child process using the provided executable
 *
 * @param fileName      - Path to the executable to start
 * @returns {Promise}   - A promise that resolves when the
 *                      process exits
 */
function executeChildProcess (fileName, args) {
  return new Promise((resolve, reject) => {
    const child = require('child_process').spawn(fileName, args)

    child.stdout.on('data', (data) => log(data.toString()))
    child.stderr.on('data', (data) => log(data.toString()))

    child.on('exit', (code) => {
      if (code !== 0) {
        return reject(new Error(fileName + ' exited with code: ' + code))
      }
      return resolve()
    })

    child.stdin.end()
  })
}

/**
 * Logs to console, unless tests are running
 *
 * @param message - Message to log
 */
function log (message) {
  if (!global.testing) {
    console.log(message)
  }
}

module.exports = {
  isDirectory,
  ensureWindows,
  executeChildProcess,
  hasVariableResources,
  log
}
