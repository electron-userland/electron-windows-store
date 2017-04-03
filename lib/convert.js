'use strict'

const path = require('path')
const spawn = require('child_process').spawn
const chalk = require('chalk')
const fs = require('fs-extra')

const Tail = require('./vendor/tail').Tail
const utils = require('./utils')

/**
 * Converts the given Electron app using Project Centennial
 * Container Virtualization.
 *
 * @param program - Program object containing the user's instructions
 * @returns - Promise
 */
function convertWithContainer (program) {
  return new Promise((resolve, reject) => {
    if (!program.desktopConverter) {
      utils.log('Could not find the Project Centennial Desktop App Converter, which is required to')
      utils.log('run the conversion to appx using a Windows Container.\n')
      utils.log('Consult the documentation at https://aka.ms/electron-windows-store for a tutorial.\n')
      utils.log('You can find the Desktop App Converter at https://www.microsoft.com/en-us/download/details.aspx?id=51691\n')
      utils.log('Exiting now - restart when you downloaded and unpacked the Desktop App Converter!')

      process.exit(0)
    }

    let preAppx = path.join(program.outputDirectory, 'pre-appx')
    let installer = path.join(program.outputDirectory, 'ElectronInstaller.exe')
    let logfile = path.join(program.outputDirectory, 'logs', 'conversion.log')
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
    ]
    let args = `& {& '${path.resolve(__dirname, '..', 'ps1', 'convert.ps1')}' ${converterArgs.join(' ')}}`
    let child, tail

    utils.log(chalk.green.bold('Starting Conversion...'))
    utils.debug(`Conversion parameters used: ${JSON.stringify(converterArgs)}`)

    try {
      child = spawn('powershell.exe', ['-NoProfile', '-NoLogo', args])
    } catch (error) {
      reject(error)
    }

    child.stdout.on('data', (data) => utils.debug(data.toString()))
    child.stderr.on('data', (data) => utils.debug(data.toString()))
    child.on('exit', () => {
      // The conversion process exited, let's look for a log file
      // However, give the PS process a 3s headstart, since we'll
      // crash if the logfile does not exist yet
      setTimeout(() => {
        tail = new Tail(logfile, {
          fromBeginning: true
        })

        tail.on('line', (data) => {
          utils.log(data)

          if (data.indexOf('Conversion complete') > -1) {
            utils.log('')
            tail.unwatch()
            resolve()
          } else if (data.indexOf('An error occurred') > -1) {
            tail.unwatch()
            reject(new Error('Detected error in conversion log'))
          }
        })

        tail.on('error', (err) => utils.log(err))
      }, 3000)
    })

    child.stdin.end()
  })
}

/**
 * Converts the given Electron app using simple file copy
 * mechanisms.
 *
 * @param program - Program object containing the user's instructions
 * @returns - Promise
 */
function convertWithFileCopy (program) {
  return new Promise((resolve, reject) => {
    let preAppx = path.join(program.outputDirectory, 'pre-appx')
    let app = path.join(preAppx, 'app')
    let manifest = path.join(preAppx, 'AppXManifest.xml')
    let manifestTemplate = path.join(__dirname, '..', 'template', 'AppXManifest.xml')
    let assets = path.join(preAppx, 'assets')
    let assetsTemplate = path.join(__dirname, '..', 'template', 'assets')

    utils.log(chalk.green.bold('Starting Conversion...'))
    utils.debug(`Using pre-appx folder: ${preAppx}`)
    utils.debug(`Using app from: ${app}`)
    utils.debug(`Using manifest template from: ${manifestTemplate}`)
    utils.debug(`Using asset template from ${assetsTemplate}`)

    // Clean output folder
    utils.log(chalk.green.bold('Cleaning pre-appx output folder...'))
    fs.emptyDirSync(preAppx)

    // Copy in the new manifest, app, assets
    utils.log(chalk.green.bold('Copying data...'))
    fs.copySync(manifestTemplate, manifest)
    utils.debug('Copied manifest template to destination')
    fs.copySync(assetsTemplate, assets)
    utils.debug('Copied asset template to destination')
    fs.copySync(program.inputDirectory, app)
    utils.debug('Copied input app files to destination')

    // Then, overwrite the manifest
    fs.readFile(manifest, 'utf8', (err, data) => {
      utils.log(chalk.green.bold('Creating manifest..'))
      let result = data
      let executable = program.packageExecutable || `app\\${program.packageName}.exe`

      if (err) {
        utils.debug(`Could not read manifest template. Error: ${JSON.stringify(err)}`)
        return utils.log(err)
      }

      result = result.replace(/\${publisherName}/g, program.publisher)
      result = result.replace(/\${publisherDisplayName}/g, program.publisherDisplayName || 'Reserved')
      result = result.replace(/\${identityName}/g, program.identityName || program.packageName)
      result = result.replace(/\${packageVersion}/g, program.packageVersion)
      result = result.replace(/\${packageName}/g, program.packageName)
      result = result.replace(/\${packageExecutable}/g, executable)
      result = result.replace(/\${packageDisplayName}/g, program.packageDisplayName || program.packageName)
      result = result.replace(/\${packageDescription}/g, program.packageDescription || program.packageName)
      result = result.replace(/\${packageBackgroundColor}/g, program.packageBackgroundColor || '#464646')

      fs.writeFile(manifest, result, 'utf8', (err) => {
        if (err) {
          const errorMessage = `Could not write manifest file in pre-appx location. Error: ${JSON.stringify(err)}`
          utils.debug(errorMessage)
          return reject(new Error(errorMessage))
        }

        resolve()
      })
    })
  })
}

module.exports = function (program) {
  if (program.containerVirtualization) {
    return convertWithContainer(program)
  } else {
    return convertWithFileCopy(program)
  }
}
