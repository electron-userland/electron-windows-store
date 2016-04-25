"use strict";

const pathExists = require('path-exists');
const spawn = require('child_process').spawn;

/**
 * Tests a given directory for existence
 * 
 * @param directory - Path to a directory
 * @returns {boolean} - Does the dir exist? 
 */
function ensureDirectory(directory) {
    return pathExists.sync(directory);
}

/**
 * Starts a child process using the provided executable
 * 
 * @param fileName      - Path to the executable to start
 * @returns {Promise}   - A promise that resolves when the
 *                      process exits
 */
function executeChildProcess(fileName, args) {

    return new Promise((resolve, reject) => {
        var child = spawn(fileName, args);
        child.stdout.on('data', (data) => console.log(data.toString()));
        child.stderr.on('data', (data) => console.log(data.toString()));

        child.on('exit', code => {
            if (code !== 0) {
                return reject(new Error(fileName + ' exited with code: ' + code));
            }
            return resolve();
        });
    });
}
module.exports = {
    ensureDirectory: ensureDirectory,
    executeChildProcess: executeChildProcess
};
