"use strict";

const path  = require('path');
const spawn = require('child_process').spawn;

module.exports = function(program) {
    return new Promise((resolve, reject) => {
        // Let's ensure we have all the things we need
        let preAppx = path.join(program.outputDirectory, 'pre-appx');
        let installer = path.join(program.outputDirectory, 'ElectronInstaller.exe');
        let converterArgs = [
            `-Installer '${installer}'`,
            `-Converter '${path.join(program.desktopConverter, 'DesktopAppConverter.ps1')}'`,
            `-ExpandedBaseImage ${program.expandedBaseImage}`,
            `-Destination '${preAppx}'`,
            `-PackageName ${program.packageName}`,
            `-Version ${program.packageVersion}`,
            `-Publisher ${program.publisher}`,
            `-AppExecutable ${program.packageExecutable}`
        ];
        let args = `& {& '${path.resolve(__dirname, '..', 'ps1', 'convert.ps1')}' ${converterArgs.join(' ')}}`,
            stdout = [],
            stderr = [],
            child;

        try {
            child = spawn('powershell.exe', [args]);
        } catch (error) {
            reject(error);
        }

        child.stdout.on('data', (data) => console.log(data.toString()));
        child.stderr.on('data', (data) => console.log(data.toString()));

        child.on('exit', () => resolve({ stderr, stdout }));

        child.stdin.end();
    });
}
