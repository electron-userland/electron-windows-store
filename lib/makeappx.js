"use strict";

const path       = require('path');
const spawn      = require('child_process').spawn;
const pathExists = require('path-exists');

module.exports = function(program) {
    return new Promise((resolve, reject) => {
        if (program.deploy === false) {
            return resolve();
        }
        
        if (!program.windowsKit) {
            return reject();
        }
        
        let makeappx = path.join(program.windowsKit, 'makeappx.exe');
        let source = path.join(program.outputDirectory, 'pre-appx');
        let destination = path.join(program.outputDirectory, `${program.packageName}.appx`);
        let child;

        try {
            child = spawn(makeappx, [`pack`, `/d`, source, `/p`, destination]);
        } catch (error) {
            reject(error);
        }

        child.stdout.on('data', (data) => console.log(data.toString()));
        child.stderr.on('data', (data) => console.log(data.toString()));

        child.on('exit', () => resolve());

        child.stdin.end();
    });
}
