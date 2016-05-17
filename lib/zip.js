"use strict";

const path  = require('path');
const spawn = require('child_process').spawn;
const chalk = require('chalk');
const utils = require('./common/utils');

module.exports = function(program) {
    return new Promise((resolve, reject) => {
        let input = program.inputDirectory;
        let output = program.outputDirectory;
        let args = `& {& '${path.resolve(__dirname, '..', 'ps1', 'zip.ps1')}' -source '${input}' -destination '${output}'}`,
            stdout = [],
            stderr = [],
            child;
        
        // If we do a simple conversion, we don't need to zip.
        if (!program.containerVirtualization) {
            return resolve();
        }
          
        console.log(chalk.green('Zipping up built Electron application...'));
        return utils.executeChildProcess('powershell.exe', ['-NoProfile', '-NoLogo', args]);        
    });
}
