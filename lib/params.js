// Ensures correct parameters
"use strict";

const utils      = require('../common/utils');
const inquirer   = require('inquirer');
const fs         = require('fs');
const os         = require('os');
const path       = require('path');

const cwd = process.cwd();

/**
 * Ensures that the currently running platform is Windows
 */
function ensureWindows() {
    if (process.platform !== 'win32') {
        console.log('This tool requires Windows 10.\n');
        console.log('You can run a virtual machine using the free VirtualBox and');
        console.log('the free Windows Virtual Machines found at http://modern.ie.\n');
        console.log('For more information, please see the readme.');
        process.exit(1);
    }
    
    let release = os.release();
    let major = parseInt(release.slice(0, 2), 10);
    let minor = parseInt(release.slice(3, 4), 10);
    let build = parseInt(release.slice(5), 10);

    if (major < 10 || (minor === 0 && build < 14316)) {
        console.log(`You are running Windows ${release}. You need at least Windows 10.0.14316.`);
        console.log(`We can't confirm that you're running the right version, but we won't stop`);
        console.log(`this process - should things fail though, you might have to update your`);
        console.log(`Windows.`);
    }
}

module.exports = function (program) {
    return new Promise((resolve, reject) => {
        const questions = [
            {
                name: 'inputDirectory',
                type: 'input',
                message: 'Please enter the path to your built Electron app: ',
                validate: (input) => {
                    if (!utils.ensureDirectory(input)) {
                        // Not found, let's try the subdir
                        return (utils.ensureDirectory(path.join(cwd, input)));
                    };
                    
                    return true;
                },
                filter: (input) => {
                    if (!utils.ensureDirectory(input)) {
                        return path.join(cwd, input);
                    } else {
                        return input;
                    }
                },
                when: () => (!program.inputDirectory)
            },
            {
                name: 'outputDirectory',
                type: 'input',
                message: 'Please enter the path to your output directory: ',
                default: path.join(cwd, 'windows-store'),
                validate: (input) => {
                    if (!utils.ensureDirectory(input) && !utils.ensureDirectory(path.join(cwd, input))) {
                        try {
                            fs.mkdirSync(input);
                            return true;
                        } catch (err) {
                            return false;
                        }
                    }
                    
                    return true;
                },
                filter: (input) => {
                    if (!utils.ensureDirectory(input)) {
                        return path.join(cwd, input);
                    } else {
                        return input;
                    }
                },
                when: () => (!program.outputDirectory)
            },
            {
                name: 'flatten',
                message: 'We heavily recommend flattening node_modules. Are you okay with us flattening all node_modules folders inside your input directory?',
                type: 'confirm',
                when: () => (!program.flatten)
            }
        ];
        
        // First, ensure that we're even running Windows
        // (and the right version of it)
        ensureWindows();
        
        // Then, let's ensure our parameters
        inquirer.prompt(questions)
            .then((answers) => {
                Object.assign(program, answers);
                resolve();
            });
    });
}
