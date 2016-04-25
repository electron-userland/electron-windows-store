"use strict";

const path    = require('path');
const spawn   = require('child_process').spawn;
const chalk   = require('chalk');
const Tail    = require('./tail').Tail;

module.exports = function(program) {
    return new Promise((resolve, reject) => {
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
