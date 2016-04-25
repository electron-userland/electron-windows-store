"use strict";

const path = require('path');
const spawn = require('child_process').spawn;
const utils = require('./common/utils');
const fs = require('fs');
const sdkDir = path.join(process.env['ProgramFiles(x86)'], 'Windows Kits', '10', 'bin\\x64');

module.exports.makeCert = function(publisherName, certFilePath) {
    try {
        fs.mkdirSync(certFilePath);
    } catch (e) {
        if (e.code !== 'EEXIST') {
            throw e;
        }
    }
    // ensure the Windows 10 SDK is installed
    utils.ensureDirectory(sdkDir);

    return utils.executeChildProcess(path.join(sdkDir, 'makecert.exe'), [
        '-r', 
        '-h', 
        '0', 
        '-n', 
        'CN=' + publisherName, 
        '-eku', 
        '1.3.6.1.5.5.7.3.3', 
        '-pe', 
        '-sv', 
        path.join(certFilePath, publisherName + '.pvk'), 
        path.join(certFilePath, publisherName + '.cer')])
    .then(() => {
        try {
            fs.unlinkSync(path.join(certFilePath, publisherName + '.pfx'))
        } catch (e) {
            if (e.code !== 'ENOENT') {
                throw e;
            }
        }

        return utils.executeChildProcess(path.join(sdkDir, 'pvk2pfx.exe'), [
            '-pvk',
            path.join(certFilePath, publisherName + '.pvk'),
            '-spc',
            path.join(certFilePath, publisherName + '.cer'),
            '-pfx',
            path.join(certFilePath, publisherName + '.pfx')
        ]);
    })
    .then(() => {
        // install pfx
        var pfx = path.join(certFilePath, publisherName + '.pfx')
        return utils.executeChildProcess('powershell.exe', [
           'Import-PfxCertificate',
           '-FilePath',
           pfx,
           '-CertStoreLocation',
           '"Cert:\\LocalMachine\\TrustedPeople"'
        ]);
    })
    .then(() => {
       return path.join(certFilePath, publisherName + '.pfx') 
    });
}

module.exports.signAppx = function (pfxFile, appxFile) {
    return utils.executeChildProcess(path.join(sdkDir, 'signtool.exe'), [
        'sign',
        '-f', 
        pfxFile,
        '-fd',
        'SHA256',
        '-v',
        appxFile]);
}
