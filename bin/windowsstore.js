#!/usr/bin/env node

/**
 * Module dependencies.
 */

const program = require('commander');
const package = require('../package.json');

program
  .version(package.version)
  .option('-i, --input-directory', 'Directory containing your application')
  .parse(process.argv);