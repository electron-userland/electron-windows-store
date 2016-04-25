"use strict";

const path = require('path');
const spawn = require('child_process').spawn;

module.exports = function(inputDir, flatten) {
    return new Promise((resolve, reject) => {
        if (flatten === false) {
            return resolve();
        }

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
