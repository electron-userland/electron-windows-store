"use strict";

const path  = require('path');
const spawn = require('child_process').spawn;
const chalk = require('chalk');
const utils = require('./common/utils');

module.exports = function(inputDir, outputDir) {
    let args = `& {& '${path.resolve(__dirname, '..', 'ps1', 'zip.ps1')}' -source '${inputDir}' -destination '${outputDir}'}`,
        stdout = [],
        stderr = [],
        child;
    console.log(chalk.green('Zipping up built Electron application...'));
    return utils.executeChildProcess('powershell.exe', ['-NoProfile', '-NoLogo', args]);
}
