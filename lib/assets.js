"use strict";

const path  = require('path');
const fs    = require('fs-extra');
const chalk = require('chalk');

module.exports = function (program) {
    return new Promise((resolve, reject) => {
        if (!program.assets) {
            return resolve();
        }

        // Let's copy in the assets
        console.log(chalk.bold.green('Copying visual assets into pre-appx folder...'));

        const assetsPath = path.join(program.outputDirectory, 'pre-appx', 'Assets');
        fs.copy(program.assets, assetsPath, (err) => {
            if (err) {
                return reject(err);
            }

            resolve();
        });
    });
}
