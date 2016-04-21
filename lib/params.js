// Ensures correct parameters
"use strict";

const pathExists = require('path-exists');
const fs         = require('fs');

module.exports = function (program) {
    return new Promise((resolve, reject) => {
        // Ensure Windows
        if (process.platform !== 'win32') {
            console.log('This tool requires Windows 10.\n');
            console.log('You can run a virtual machine using the free VirtualBox and');
            console.log('the free Windows Virtual Machines found at http://modern.ie.\n');
            console.log('For more information, please see the readme.');
            process.exit(1);
        }

        // Ensure parameter input
        if (!program.inputDirectory) {
            console.log('Error: Missing parameter input directory.');
            program.outputHelp();
            process.exit(1);
        }

        // Ensure parameter output
        if (!program.outputDirectory) {
            console.log('Error: Missing parameter outputDirectory directory.');
            program.outputHelp();
            process.exit(1);
        }

        // Ensure input directory exists
        if (!pathExists.sync(program.inputDirectory)) {
            console.log('Error: Given input directory does not exist');
            program.outputHelp();
            process.exit(1);
        }

        // Ensure output directory exists
        pathExists(program.outputDirectory)
            .then((exists) => {
                if (exists) {
                    return resolve();
                }

                fs.mkdir(program.outputDirectory, (err) => {
                    if (err) {
                        return reject(err);
                    }

                    resolve();
                });
            });
    });
}