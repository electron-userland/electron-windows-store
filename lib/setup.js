'use strict'

/**
 * For setup, we need a number of params:
 *  - DesktopConverter "C:\Tools\DesktopConverter"
 *  - ExpandedBaseImage "C:\ProgramData\Microsoft\Windows\Images\BaseImage-14316\"
 *  - Publisher "CN=testca"
 *  - DevCert "C:\Tools\DesktopConverter\Certs\devcert.pfx"
 */

const path = require('path')
const inquirer = require('inquirer')
const pathExists = require('path-exists')
const defaults = require('lodash.defaults')
const chalk = require('chalk')

const utils = require('./utils')
const sign = require('./sign')
const {loadManifest} = require('./manifest')
const dotfile = require('./dotfile')()

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
  if (program.isModuleUse) {
    return Promise.resolve(program)
  }

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
async function wizardSetup (program) {

  const welcome = `
    Welcome to the Electron-Windows-Store tool!

    This tool will assist you with turning your Electron app into
    a swanky Windows Store app.

    We need to know some settings. We will ask you only once and store
    your answers in your profile folder in a .electron-windows-store
    file.
    `.replace(/\n\s*/g, '\n').trim()

  const complete = 'Setup complete, moving on to package your app!'

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
      default: utils.getDefaultWindowsKitLocation(),
      when: () => (!program.windowsKit)
    }
  ]

  if (!program.isModuleUse) {
    utils.log(welcome)
  }

  // Remove the Desktop Converter Questions if not installed
  if (program.didInstallDesktopAppConverter === false) {
    questions = questions.slice(3)
  }

  if (program.bundleFromCwd) {
    program.inputDirectory = program.inputDirectory || process.cwd()
    program.outputDirectory = program.outputDirectory || path.join(process.cwd(), '/build')
  }

  if (program.importConfigFromManifest) {
    program.manifest = program.manifest || path.join(program.inputDirectory, './AppxManifest.xml')
    await loadManifest(program)
  }

  if (program.isModuleUse) {
    program.windowsKit = program.windowsKit || utils.getDefaultWindowsKitLocation()
  } else {
    var answers = await inquirer.prompt(questions)
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
  }

  if (typeof program.publisher !== 'string') {
    Promise.reject(new Error('program.publisher must be a string'))
  }

  if (program.devCert) {
    let parsed = path.parse(program.devCert)
    program.certFolder = program.certFolder || parsed.dir
    program.certFileName = program.certFolder || parsed.name
  } else {
    let publisher = program.publisher.split('=').pop()
    program.certFolder = program.certFolder || path.join(process.env.APPDATA, 'electron-windows-store', publisher)
    program.certFileName = program.certFileName || publisher
    program.devCert = path.join(program.certFolder, `${program.certFileName}.pfx`)
  }

  //program.assets = program.assets || path.join(program.inputDirectory, '/assets')
  program.appx = program.appx || path.join(program.outputDirectory, `${program.packageName}.appx`)

  await sign.prepareCert(program)

  dotfile.set({devCert: program.devCert})

  utils.log(complete)
  return program
}

/**
 * Logs the current configuration to utils
 *
 * @param program - Commander program object
 */
function logConfiguration (program) {
  utils.log(chalk.bold.green.underline('\nConfiguration:'))
  utils.log(`Desktop Converter Location:    ${program.desktopConverter}`)
  utils.log(`Expanded Base Image:           ${program.expandedBaseImage}`)
  utils.log(`Publisher:                     ${program.publisher}`)
  utils.log(`Dev Certificate:               ${program.devCert}`)
  utils.log(`Windows Kit Location:          ${program.windowsKit}
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
  if (isSetupRequired(program)) {
    // If we're setup, merge the dotfile configuration into the program
    defaults(program, dotfile.get())
    logConfiguration(program)
    Promise.resolve()
  } else {
    // We're not setup, let's do that now
    return askForDependencies(program)
      .then(() => wizardSetup(program))
      .then(() => logConfiguration(program))
  }
}

module.exports = setup
