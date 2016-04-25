"use strict";

/**
 * For setup, we need a number of params:
 *  - DesktopConverter "C:\Tools\DesktopConverter"
 *  - ExpandedBaseImage "C:\ProgramData\Microsoft\Windows\Images\BaseImage-14316\"
 *  - Publisher "CN=testca"
 *  - DevCert "C:\Tools\DesktopConverter\Certs\devcert.pfx"
 */

const dotfile    = require('./dotfile')();
const path       = require('path');
const utils      = require('./common/utils');
const sign       = require('./sign');
const inquirer   = require('inquirer');
const pathExists = require('path-exists');
const defaults   = require('lodash.defaults');
const multiline  = require('multiline');
const chalk      = require('chalk');
const fs         = require('fs');
/**
 * Determines whether all setup settings are okay.
 *
 * @returns {boolean} - Whether everything is setup correctly.
 */
function isSetup() {
    const config = dotfile.get();

    return (config.desktopConverter &&
            config.expandedBaseImage &&
            config.publisher &&
            config.devCert &&
            config.windowsKit);
}

/**
 * Asks the user if dependencies are installed. If she/he declines, we exit the process.
 */
function askForDependencies() {
    const questions = [
        {
            name: 'didInstallDesktopAppConverter',
            type: 'confirm',
            message: 'Did you already download and install the Desktop App Converter? It is required to run this tool. ',
        },
        {
            name: 'makeCertificate',
            type: 'confirm',
            message: 'You need to install a development certificate in order to run your app. Would you like us to create one? ',
        },
    ];

    return inquirer.prompt(questions)
        .then((answers) => {
            if (!answers.didInstallDesktopAppConverter) {
                console.log('Consult the documentation at https://aka.ms/electron-windows-store for a tutorial.\n')
                console.log('You can find the Desktop App Converter at https://www.microsoft.com/en-us/download/details.aspx?id=51691\n');
                console.log('Exiting now - restart when you downloaded and unpacked the Desktop App Converter!');

                process.exit(0);
            }

            dotfile.append('makeCertificate', answers.makeCertificate);
        })
}

function wizardSetup() {

        const questions = [
            {
                name: 'desktopConverter',
                type: 'input',
                message: 'Please enter the path to your Desktop App Converter (DesktopAppConverter.ps1): ',
                validate: (input) => pathExists.sync(input)
            },
            {
                name: 'expandedBaseImage',
                type: 'input',
                message: 'Please enter the path to your Expanded Base Image: ',
                default: 'C:\\ProgramData\\Microsoft\\Windows\\Images\\BaseImage-14316\\',
                validate: (input) => pathExists.sync(input)
            },
            {
                name: 'devCert',
                type: 'input',
                message: 'Please enter the path to your development PFX certficate: ',
                default: null,
                when: () => (!dotfile.get().makeCertificate)
            },
            {
                name: 'publisher',
                type: 'input',
                message: 'Please enter your publisher identity: ',
                default: 'CN=developmentca'
            },
            {
                name: 'windowsKit',
                type: 'input',
                message: 'Please enter the location of your Windows Kit\'s bin folder: ',
                default: 'C:\\Program Files (x86)\\Windows Kits\\10\\bin\\x64'
            }
        ];

        return inquirer.prompt(questions)
            .then((answers) => {
                dotfile.set({
                    desktopConverter: answers.desktopConverter,
                    expandedBaseImage: answers.expandedBaseImage,
                    devCert: answers.devCert,
                    publisher: answers.publisher,
                    windowsKit: answers.windowsKit,
                    makeCertificate: dotfile.get().makeCertificate
                });

                if (dotfile.get().makeCertificate) {
                    console.log('CREATING CERTIFICATE');
                    var publisher = dotfile.get().publisher.split('=')[1];
                    var certFolder = path.join(process.env.APPDATA, 'electron-windows-store', publisher);

                    return sign.makeCert(publisher, certFolder)
                    .then(pfxFile => {
                       console.log('created and installed certificate:');
                       console.log(pfxFile);
                       dotfile.set({devCert: pfxFile}); 
                    });
                }

                return;
            });
}

module.exports = function (program) {
    return new Promise((resolve, reject) => {
        const welcome = multiline.stripIndent(function () {/*
            Welcome to the Electron-Windows-Store tool!

            This tool will assist you with turning your Electron app into
            a swanky Windows Store app.

            We need to know some settings. We will ask you only once and store
            your answers in your profile folder in a .electron-windows-store
            file.

        */});
        const complete = multiline.stripIndent(function () {/*

            Setup complete, moving on to package your app!

        */});

        if (isSetup()) {
            // If we're setup, merge the dotfile configuration into the program
            const config = dotfile.get();
            defaults(program, config);

            console.log(chalk.bold.green.underline('\nConfiguration found. Assuming the following: '));
            console.log(`Desktop Converter Location:    ${config.desktopConverter}`);
            console.log(`Expanded Base Image:           ${config.expandedBaseImage}`);
            console.log(`Publisher:                     ${config.publisher}`);
            console.log(`Dev Certificate:               ${config.devCert}\n`);
            console.log(`Windows Kit Location:          ${config.windowsKit}\n`);

            return resolve();
        }

        console.log(welcome);

        askForDependencies()
            .then(() => wizardSetup())
            .then(() => {
                console.log(complete);
                resolve();
            })
            .catch((e) => reject(e));
    });
}
