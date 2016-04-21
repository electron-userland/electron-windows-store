#!/usr/bin/env node

/**
 * Module dependencies.
 */

const program    = require('commander');

const package      = require('../package.json');
const ensureParams = require('../lib/params');
const zip          = require('../lib/zip');
const flatten      = require('../lib/flatten');

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