"use strict";

const pathExists = require('path-exists');

/**
 * Tests a given directory for existence
 * 
 * @param directory - Path to a directory
 * @returns {boolean} - Does the dir exist? 
 */
function ensureDirectory(directory) {
    return pathExists.sync(directory);
}

function ensureFile(filePath) {
    
}
module.exports = {
    ensureDirectory: ensureDirectory
};
