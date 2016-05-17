"use strict";

const path  = require('path');
const spawn = require('child_process').spawn;
const fs    = require('fs-extra');
const chalk = require('chalk');
const utils = require('./common/utils');

module.exports.makeCert = function (publisherName, certFilePath, program) {
    let cer = path.join(certFilePath, `${publisherName}.cer`);
    let pvk = path.join(certFilePath, `${publisherName}.pvk`);
    let pfx = path.join(certFilePath, `${publisherName}.pfx`);
    
    let makecert = path.join(program.windowsKit, 'makecert.exe');
    let makecertArgs = ['-r', '-h', '0', '-n', `CN=${publisherName}`, '-eku', '1.3.6.1.5.5.7.3.3', '-pe', '-sv', pvk, cer];

    let pk2pfx = path.join(program.windowsKit, 'pvk2pfx.exe');
    let pk2pfxArgs = [ '-pvk', pvk, '-spc', cer, '-pfx', pfx];
    let installPfxArgs = [ 'Import-PfxCertificate', '-FilePath', pfx, '-CertStoreLocation', '"Cert:\\LocalMachine\\TrustedPeople"'];
    
    // Ensure the target directory exists
    fs.ensureDirSync(certFilePath);
    
    // Inform the user about the password
    console.log(chalk.green.bold('When asked to enter a password, please select "None".'));
    
    return utils.executeChildProcess(makecert, makecertArgs)
        .then(() => utils.executeChildProcess(pk2pfx, pk2pfxArgs))
        .then(() => utils.executeChildProcess('powershell.exe', installPfxArgs))
        .then(() => pfx);
}

module.exports.signAppx = function (program) {
    let pfxFile = program.devCert;
    let appxFile = path.join(program.outputDirectory, `${program.packageName}.appx`);

    return utils.executeChildProcess(path.join(program.windowsKit, 'signtool.exe'), [ 'sign', '-f', pfxFile, '-fd', 'SHA256', '-v', appxFile]);
}
