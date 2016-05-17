"use strict";

const path    = require('path');
const spawn   = require('child_process').spawn;
const chalk   = require('chalk');
const Tail    = require('./tail').Tail;
const fs      = require('fs-extra');

/**
 * Converts the given Electron app using Project Centennial
 * Container Virtualization.
 * 
 * @param program - Program object containing the user's instructions
 * @returns - Promise
 */
function convertWithContainer(program) {
    return new Promise((resolve, reject) => {
        if (!program.desktopConverter) {
            console.log('Could not find the Project Centennial Desktop App Converter, which is required to');
            console.log('run the conversion to appx using a Windows Container.\n');
            console.log('Consult the documentation at https://aka.ms/electron-windows-store for a tutorial.\n');
            console.log('You can find the Desktop App Converter at https://www.microsoft.com/en-us/download/details.aspx?id=51691\n');
            console.log('Exiting now - restart when you downloaded and unpacked the Desktop App Converter!');

            process.exit(0);
        }
        
        let preAppx = path.join(program.outputDirectory, 'pre-appx');
        let installer = path.join(program.outputDirectory, 'ElectronInstaller.exe');
        let logfile = path.join(program.outputDirectory, 'logs', 'conversion.log');
        let converterArgs = [
            `-LogFile ${logfile}`,
            `-Installer '${installer}'`,
            `-Converter '${path.join(program.desktopConverter, 'DesktopAppConverter.ps1')}'`,
            `-ExpandedBaseImage ${program.expandedBaseImage}`,
            `-Destination '${preAppx}'`,
            `-PackageName "${program.packageName}"`,
            `-Version ${program.packageVersion}`,
            `-Publisher "${program.publisher}"`,
            `-AppExecutable '${program.packageExecutable}'`
        ];
        let args = `& {& '${path.resolve(__dirname, '..', 'ps1', 'convert.ps1')}' ${converterArgs.join(' ')}}`;
        let child, tail;
        
        console.log(chalk.green.bold('Starting Conversion...'));
        
        try {
            child = spawn('powershell.exe', ['-NoProfile', '-NoLogo', args]);
        } catch (error) {
            reject(error);
        }

        child.stdout.on('data', (data) => console.log(data.toString()));
        child.stderr.on('data', (data) => console.log(data.toString()));
        child.on('exit', () => {
            // The conversion process exited, let's look for a log file
            // However, give the PS process a 3s headstart, since we'll
            // crash if the logfile does not exist yet
            setTimeout(() => {
                tail = new Tail(logfile, {
                    fromBeginning: true
                });

                tail.on('line', (data) => {                    
                    console.log(data);

                    if (data.indexOf('Conversion complete') > -1) {
                        console.log('');
                        tail.unwatch();
                        resolve();
                    } else if (data.indexOf('An error occurred') > -1) {
                        tail.unwatch();
                        reject();
                    }
                });

                tail.on('error', (err) => console.log(err));
            }, 3000);
        });

        child.stdin.end();
    });
}

/**
 * Converts the given Electron app using simple file copy
 * mechanisms.
 * 
 * @param program - Program object containing the user's instructions
 * @returns - Promise
 */
function convertWithFileCopy(program) {
    return new Promise((resolve, reject) => {
        let preAppx = path.join(program.outputDirectory, 'pre-appx');
        let app = path.join(preAppx, 'app');
        let manifest = path.join(preAppx, 'appxmanifest.xml');
        let manifestTemplate = path.join(__dirname, '..', 'template', 'appxmanifest.xml');
        let assets = path.join(preAppx, 'assets');
        let assetsTemplate = path.join(__dirname, '..', 'template', 'assets');
        
        console.log(chalk.green.bold('Starting Conversion...'));
        
        // Ccopy in the new manifest, app, assets
        fs.copySync(manifestTemplate, manifest);
        fs.copySync(assetsTemplate, assets);
        fs.copySync(program.inputDirectory, app);
        
        // Then, overwrite the manifest
        fs.readFile(manifest, 'utf8', (err, data) => {
            let result = data;
            
            if (err) {
                return console.log(err);
            }

            result = result.replace(/\${publisherName}/g, program.publisher);
            result = result.replace(/\${packageVersion}/g, program.packageVersion);
            result = result.replace(/\${packageName}/g, program.packageName);
            result = result.replace(/\${packageExecutable}/g, `app\\${program.packageName}.exe`);
            result = result.replace(/\${packageDisplayName}/g, program.packageDisplayName || program.packageName);
            result = result.replace(/\${packageDescription}/g, program.packageDescription || program.packageName);
            
            fs.writeFile(manifest, result, 'utf8', (err) => {
                if (err) {
                    console.log(err);
                    return reject();
                };
                
                resolve();
            });
        });
    });
}

module.exports = function(program) {
    if (program.containerVirtualization) {
        return convertWithContainer(program);
    } else {
        return convertWithFileCopy(program);
    }
}
