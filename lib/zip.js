"use strict";

const path  = require('path');
const spawn = require('child_process').spawn;
const chalk = require('chalk');

module.exports = function(inputDir, outputDir) {
    return new Promise((resolve, reject) => {
        let args = `& {& '${path.resolve(__dirname, '..', 'ps1', 'zip.ps1')}' -Source '${inputDir}' -Destination '${outputDir}'}`,
            child;
        
        console.log(chalk.green('Zipping up built Electron application...'));
        
        try {
            child = spawn('powershell.exe', ['-NoProfile', '-NoLogo', args]);
        } catch (error) {
            reject(error);
        }

        child.stdout.on('data', (data) => console.log(data.toString()));
        child.stderr.on('data', (data) => console.log(data.toString()));

        child.on('exit', () => {
            resolve();
        });

        child.stdin.end();
    });
}
