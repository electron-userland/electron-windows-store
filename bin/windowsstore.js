#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander')
var os = require('os')
var chalk = require('chalk')
var pack = require('../package.json')

// Ensure Node 4
if (parseInt(process.versions.node[0], 10) < 4) {
  console.log('You need at least Node 4.x to run this script')
}

// Little helper function turning string input into an array
function list (val) {
  return val.split(',')
}

program
  .version(pack.version)
  .option('-c, --container-virtualization', 'Create package using Windows Container virtualization')
  .option('-b, --windows-build', 'Display Windows Build information')
  .option('-i, --input-directory <path>', 'Directory containing your application')
  .option('-o, --output-directory <path>', 'Output directory for the appx')
  .option('-f, --flatten <true|false>', 'Flatten Node modules without warning', (i) => (i === 'true'))
  .option('-p, --package-version <version>', 'Version of the app package')
  .option('-n, --package-name <name>', 'Name of the app package')
  .option('--identity-name <name>', 'Name for identity')
  .option('--package-display-name <displayName>', 'Dispay name of the package')
  .option('--package-description <description>', 'Description of the package')
  .option('--package-background-color <color>', 'Background color for the app icon (example: #464646)')
  .option('-e, --package-executable <executablePath>', 'Path to the package executable')
  .option('-a, --assets <assetsPath>', 'Path to the visual assets for the appx')
  .option('-m, --manifest <manifestPath>', 'Path to a manifest, if you want to overwrite the default one')
  .option('-d, --deploy <true|false>', 'Should the app be deployed after creation?')
  .option('--publisher <publisher>', 'Publisher to use (example: CN=developmentca)')
  .option('--publisher-display-name <publisherDisplayName>', 'Publisher display name to use')
  .option('--windows-kit <windows-kit>', 'Path to the Windows Kit bin folder')
  .option('--dev-cert <dev-cert>', 'Path to the developer certificate to use')
  .option('--cert-pass <cert-pass>', 'Certification password')
  .option('--desktop-converter <desktop-converter>', 'Path to the desktop converter tools')
  .option('--expanded-base-image <base-image>', 'Path to the expanded base image')
  .option('--make-pri <true|false>', 'Use makepri.exe (you don\'t need to unless you know you do)', (i) => (i === 'true'))
  .option('--makeappx-params <params>', 'Additional parameters for Make-AppXPackage (example: --makeappx-params "/l","/d")', list)
  .option('--signtool-params <params>', 'Additional parameters for signtool.exe (example: --makeappx-params "/l","/d")', list)
  .option('--create-config-params <params>', 'Additional parameters for makepri.exe "createconfig" (example: --create-config-params "/l","/d")', list)
  .option('--create-pri-params <params>', 'Additional parameters for makepri.exe "new" (example: --create-pri-params "/l","/d")', list)
  .option('--verbose <true|false>', 'Enable debug mode')
  .parse(process.argv)

if (program.windowsBuild) {
  console.log(os.release())
}

if (program.verbose) {
  var debug = process.env.DEBUG || ''
  process.env.DEBUG = 'electron-windows-store,' + debug
}

var ensureParams = require('../lib/params')
var zip = require('../lib/zip')
var flatten = require('../lib/flatten')
var setup = require('../lib/setup')
var sign = require('../lib/sign')
var assets = require('../lib/assets')
var convert = require('../lib/convert')
var makeappx = require('../lib/makeappx')
var manifest = require('../lib/manifest')
var deploy = require('../lib/deploy')
var makepri = require('../lib/makepri')

setup(program)
  .then(() => ensureParams(program))
  .then(() => flatten(program))
  .then(() => zip(program))
  .then(() => convert(program))
  .then(() => assets(program))
  .then(() => manifest(program))
  .then(() => makepri(program))
  .then(() => makeappx(program))
  .then(() => sign.signAppx(program))
  .then(() => deploy(program))
  .then(() => console.log(chalk.bold.green('All done!')))
  .catch(e => {
    console.log(e)
    console.log(e.stack)
  })
