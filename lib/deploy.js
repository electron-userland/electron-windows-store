"use strict";

const path  = require('path');
const chalk = require('chalk');
const spawn = require('child_process').spawn;

module.exports = function(program) {
    return new Promise((resolve, reject) => {
        if (!program.deploy) {
            return resolve();
        }
        
        console.log(chalk.bold.green('Deploying package to system...'));
        
        let args = `& {& Add-AppxPackage '${program.outputDirectory}\\${program.packageName}.appx'}`,
            child;

        try {
            child = spawn('powershell.exe', ['-NoProfile', '-NoLogo', args]);
        } catch (error) {
            reject(error);
        }

        child.stdout.on('data', (data) => console.log(data.toString()));
        child.stderr.on('data', (data) => console.log(data.toString()));

        child.on('exit', () => resolve());

        child.stdin.end();
    });
}
