#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program    = require('commander');

var package      = require('../package.json');
var ensureParams = require('../lib/params');
var zip          = require('../lib/zip');
var flatten      = require('../lib/flatten');

// Ensure Node 4
if (parseInt(process.versions.node[0], 10) < 4) {
    console.log('You need at least Node 4.x to run this script');
}

program
    .version(package.version)
    .option('-i, --input-directory <dir>', 'Directory containing your application')
    .option('-o, --output-directory <dir>', 'Output directory for the appx')
    .option('-f, --flatten', 'Flatten Node modules without warning')
    .parse(process.argv);

ensureParams(program)
    .then(() => flatten(program.inputDirectory, program.flatten))
    .then(() => zip(program.inputDirectory, program.outputDirectory))
    .catch(e => console.log(e));