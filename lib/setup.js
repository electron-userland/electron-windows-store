'use strict'

/**
 * For setup, we need a number of params:
 *  - DesktopConverter "C:\Tools\DesktopConverter"
 *  - ExpandedBaseImage "C:\ProgramData\Microsoft\Windows\Images\BaseImage-14316\"
 *  - Publisher "CN=testca"
 *  - DevCert "C:\Tools\DesktopConverter\Certs\devcert.pfx"
 */

const dotfile = require('./dotfile')()
const path = require('path')
const sign = require('./sign')
const inquirer = require('inquirer')
const pathExists = require('path-exists')
const defaults = require('lodash.defaults')
const multiline = require('multiline')
const chalk = require('chalk')

/**
 * Determines whether all setup settings are okay.
 *
 * @returns {boolean} - Whether everything is setup correctly.
 */
function isSetupRequired (program) {
  const config = dotfile.get() || {}
  const hasPublisher = (config.publisher || program.publisher)
  const hasDevCert = (config.devCert || program.devCert)
  const hasWindowsKit = (config.windowsKit || program.windowsKit)
  const hasBaseImage = (config.expandedBaseImage || program.expandedBaseImage)
  const hasConverterTools = (config.desktopConverter || program.desktopConverter)

  if (!program.containerVirtualization) {
    return (hasPublisher && hasDevCert && hasWindowsKit)
  } else {
    return (hasPublisher && hasDevCert && hasWindowsKit && hasBaseImage && hasConverterTools)
  }
}

/**
 * Asks the user if dependencies are installed. If she/he declines, we exit the process.
 *
 * @param program - Commander program object
 * @returns {Promise} - Promsise that returns once user responded
 */
function askForDependencies (program) {
  const questions = [
    {
      name: 'didInstallDesktopAppConverter',
      type: 'confirm',
      message: 'Did you download and install the Desktop App Converter? It is *not* required to run this tool. '
    },
    {
      name: 'makeCertificate',
      type: 'confirm',
      message: 'You need to install a development certificate in order to run your app. Would you like us to create one? '
    }
  ]

  return inquirer.prompt(questions)
    .then((answers) => {
      program.didInstallDesktopAppConverter = answers.didInstallDesktopAppConverter
      program.makeCertificate = answers.makeCertificate
    })
}

/**
 * Runs a wizard, helping the user setup configuration
 *
 * @param program - Commander program object
 * @returns {Promise} - Promsise that returns once wizard completed
 */
function wizardSetup (program) {
  const welcome = multiline.stripIndent(function () { /*
        Welcome to the Electron-Windows-Store tool!

        This tool will assist you with turning your Electron app into
        a swanky Windows Store app.

        We need to know some settings. We will ask you only once and store
        your answers in your profile folder in a .electron-windows-store
        file.

    */
  })
  const complete = multiline.stripIndent(function () { /*

        Setup complete, moving on to package your app!

    */
  })

  let questions = [
    {
      name: 'desktopConverter',
      type: 'input',
      message: 'Please enter the path to your Desktop App Converter (DesktopAppConverter.ps1): ',
      validate: (input) => pathExists.sync(input),
      when: () => (!program.desktopConverter)
    },
    {
      name: 'expandedBaseImage',
      type: 'input',
      message: 'Please enter the path to your Expanded Base Image: ',
      default: 'C:\\ProgramData\\Microsoft\\Windows\\Images\\BaseImage-14316\\',
      validate: (input) => pathExists.sync(input),
      when: () => (!program.expandedBaseImage)
    },
    {
      name: 'devCert',
      type: 'input',
      message: 'Please enter the path to your development PFX certficate: ',
      default: null,
      when: () => (!dotfile.get().makeCertificate || !program.devCert)
    },
    {
      name: 'publisher',
      type: 'input',
      message: 'Please enter your publisher identity: ',
      default: 'CN=developmentca',
      when: () => (!program.publisher)
    },
    {
      name: 'windowsKit',
      type: 'input',
      message: "Please enter the location of your Windows Kit's bin folder: ",
      default: 'C:\\Program Files (x86)\\Windows Kits\\10\\bin\\x64',
      when: () => (!program.windowsKit)
    }
  ]

  console.log(welcome)

  // Remove the Desktop Converter Questions if not installed
  if (program.didInstallDesktopAppConverter === false) {
    questions = questions.slice(3)
  }

  return inquirer.prompt(questions)
    .then((answers) => {
      dotfile.set({
        desktopConverter: answers.desktopConverter || false,
        expandedBaseImage: answers.expandedBaseImage || false,
        devCert: answers.devCert,
        publisher: answers.publisher,
        windowsKit: answers.windowsKit,
        makeCertificate: dotfile.get().makeCertificate
      })

      program.desktopConverter = answers.desktopConverter
      program.expandedBaseImage = answers.expandedBaseImage
      program.devCert = answers.devCert
      program.publisher = answers.publisher
      program.windowsKit = answers.windowsKit

      if (program.makeCertificate) {
        console.log(chalk.bold.green('Creating Certficate'))
        let publisher = dotfile.get().publisher.split('=')[1]
        let certFolder = path.join(process.env.APPDATA, 'electron-windows-store', publisher)

        return sign.makeCert(publisher, certFolder, program)
          .then(pfxFile => {
            console.log('Created and installed certificate:')
            console.log(pfxFile)
            dotfile.set({devCert: pfxFile})
          })
      }

      console.log(complete)

      return
    })
}

/**
 * Logs the current configuration to console
 *
 * @param program - Commander program object
 */
function logConfiguration (program) {
  console.log(chalk.bold.green.underline('\nConfiguration: '))
  console.log(`Desktop Converter Location:    ${program.desktopConverter}`)
  console.log(`Expanded Base Image:           ${program.expandedBaseImage}`)
  console.log(`Publisher:                     ${program.publisher}`)
  console.log(`Dev Certificate:               ${program.devCert}`)
  console.log(`Windows Kit Location:          ${program.windowsKit}
`)
}

/**
 * Runs setup, checking if all configuration is existent,
 * and merging the dotfile with the program object
 *
 * @param program - Commander program object
 * @returns {Promise} - Promsise that returns once setup completed
 */
function setup (program) {
  return new Promise((resolve, reject) => {
    if (isSetupRequired(program)) {
      // If we're setup, merge the dotfile configuration into the program
      defaults(program, dotfile.get())
      logConfiguration(program)
      resolve()
    } else {
      // We're not setup, let's do that now
      askForDependencies(program)
        .then(() => wizardSetup(program))
        .then(() => logConfiguration(program))
        .then(() => resolve())
        .catch((e) => reject(e))
    }
  })
}

module.exports = setup
