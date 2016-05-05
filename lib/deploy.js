"use strict";

const path = require('path');
const spawn = require('child_process').spawn;

module.exports = function(program) {
    return new Promise((resolve, reject) => {
        if (program.deploy === false) {
            return resolve();
        }
        
        let args = `& {& Add-AppxPackage '${inputDir}'}`,
            child;

        try {
            child = spawn('powershell.exe', ['-NoProfile', '-NoLogo', args]);
        } catch (error) {
            reject(error);
        }

        child.stdout.on('data', (data) => console.log(data.toString()));
        child.stderr.on('data', (data) => console.log(data.toString()));

        child.on('exit', () => resolve({ stderr, stdout }));

        child.stdin.end();
    });
}
