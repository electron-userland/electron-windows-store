"use strict";

const path = require('path');
const spawn = require('child_process').spawn;

module.exports = function(inputDir, flattenWithoutWarning) {

    if (!flattenWithoutWarning) {
        console.log('We are going to flatten the node modules required for your application.\n');
    }
    
    return new Promise((resolve, reject) => {
        let args = `& {& '${path.resolve(__dirname, '..', 'ps1', 'flattennpmmodules.ps1')}' -source '${inputDir}'}`,
            stdout = [],
            stderr = [],
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