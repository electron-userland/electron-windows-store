#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program    = require('commander');

var package      = require('../package.json');
var ensureParams = require('../lib/params');
var zip          = require('../lib/zip');
var flatten      = require('../lib/flatten');
var setup        = require('../lib/setup');
var convert      = require('../lib/convert');
var assets       = require('../lib/assets');

// Ensure Node 4
if (parseInt(process.versions.node[0], 10) < 4) {
    console.log('You need at least Node 4.x to run this script');
}

program
    .version(package.version)
    .option('-i, --input-directory <dir>', 'Directory containing your application')
    .option('-o, --output-directory <dir>', 'Output directory for the appx')
    .option('-f, --flatten <flatten>', 'Flatten Node modules without warning', (i) => (i === 'true'))
    .option('-p, --package-version <ver>', 'Version of the app package')
    .option('-n, --package-name <name>', 'Name of the app package')
    .option('-e, --package-executable <executable>', 'Path to the package executable')
    .option('-a, --assets <assets>', 'Path to the visual assets for the appx')
    .option('-m, --manifest <manifest>', 'Path to a manifest, if you want to overwrite the default one')
    .parse(process.argv);

setup(program)
    .then(() => ensureParams(program))
    .then(() => flatten(program.inputDirectory, program.flatten))
    .then(() => zip(program.inputDirectory, program.outputDirectory))
    .then(() => convert(program))
    .then(() => assets(program))
    .then(() => manifest(program))
    .catch(e => console.log(e));