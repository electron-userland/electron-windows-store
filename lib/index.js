'use strict'

const zip = require('./zip')
const flatten = require('./flatten')
const setup = require('./setup')
const sign = require('./sign')
const assets = require('./assets')
const convert = require('./convert')
const finalSay = require('./finalsay')
const makeappx = require('./makeappx')
const manifest = require('./manifest')
const deploy = require('./deploy')
const makepri = require('./makepri')

/**
 * Transforms a given input directory into a Windows Store package.
 *
 * @param {WindowsStoreOptions} program
 *
 * @typedef WindowsStoreOptions
 * @type {Object}
 * @property {boolean}   containerVirtualization - Create package using Windows Container virtualization
 * @property {string}    inputDirectory          - Directory containing your application
 * @property {string}    outputDirectory         - Output directory for the appx
 * @property {boolean}   flatten                 - Flatten Node modules without warning
 * @property {string}    packageVersion          - Version of the app package
 * @property {string}    packageName             - Name of the app package
 * @property {string}    packageDisplayName      - Dispay name of the package
 * @property {string}    packageDescription      - Description of the package
 * @property {string}    packageBackgroundColor  - Background color for the app icon (example: #464646)
 * @property {string}    packageExecutable       - Path to the package executable
 * @property {string}    assets                  - Path to the visual assets for the appx
 * @property {string}    manifest                - Path to a manifest, if you want to overwrite the default one
 * @property {boolean}   deploy                  - Should the app be deployed after creation?
 * @property {string}    publisher               - Publisher to use (example: CN=developmentca)
 * @property {string}    windowsKit              - Path to the Windows Kit bin folder
 * @property {string}    devCert                 - Path to the developer certificate to use
 * @property {string}    desktopConverter        - Path to the desktop converter tools
 * @property {string}    expandedBaseImage       - Path to the expanded base image
 * @property {[string]}  makeappxParams          - Additional parameters for Make-AppXPackage
 * @property {[string]}  signtoolParams          - Additional parameters for signtool.exe
 * @property {[string]}  createConfigParams      - Additional parameters for makepri.exe createconfig
 * @property {[string]}  createPriParams         - Additional parameters for makepri.exe new
 * @property {function}  finalSay                - A function that is called before makeappx.exe executes. Accepts a promise.
 *
 * @returns {Promise} - A promise that completes once the appx has been created
 */
module.exports = function windowsStore (program) {
  program.isModuleUse = true

  return setup(program)
    .then(() => flatten(program))
    .then(() => zip(program))
    .then(() => convert(program))
    .then(() => assets(program))
    .then(() => manifest(program))
    .then(() => makepri(program))
    .then(() => finalSay(program))
    .then(() => makeappx(program))
    .then(() => sign.signAppx(program))
    .then(() => deploy(program))
}
