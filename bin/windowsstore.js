#!/usr/bin/env node

/**
 * Module dependencies.
 */

const program      = require('commander');
const path         = require('path');
const package      = require('../package.json');
const ensureParams = require('../lib/params');
const zip          = require('../lib/zip');
const flatten      = require('../lib/flatten');
const setup        = require('../lib/setup');
const sign         = require('../lib/sign');
const assets       = require('../lib/assets');
const convert      = require('../lib/convert');
const makeappx     = require('../lib/makeappx');

// Ensure Node 4
if (parseInt(process.versions.node[0], 10) < 4) {
    console.log('You need at least Node 4.x to run this script');
}

program
    .version(package.version)
    .option('-i, --input-directory <path>', 'Directory containing your application')
    .option('-o, --output-directory <path>', 'Output directory for the appx')
    .option('-f, --flatten <true|false>', 'Flatten Node modules without warning', (i) => (i === 'true'))
    .option('-p, --package-version <version>', 'Version of the app package')
    .option('-n, --package-name <name>', 'Name of the app package')
    .option('-e, --package-executable <executablePath>', 'Path to the package executable')
    .option('-a, --assets <assetsPath>', 'Path to the visual assets for the appx')
    .option('-m, --manifest <manifestPath>', 'Path to a manifest, if you want to overwrite the default one')
    .option('-d, --deploy <true|false>', 'Should the app be deployed after creation?')
    .parse(process.argv);

setup(program)
    .then(() => ensureParams(program))
    .then(() => flatten(program.inputDirectory, program.flatten))
    .then(() => zip(program.inputDirectory, program.outputDirectory))
    .then(() => convert(program))
    .then(() => assets(program))
    .then(() => manifest(program))
    .then(() => makeappx(program))
    .then(() => {
      return sign.signAppx(program.devCert, path.join(program.outputDirectory, '\\appx\\', program.packageName));
    })
    .catch(e => {console.log(e); console.log(e.stack);});
