'use strict'

const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')

const utils = require('./utils')

function makeCert (publisherName, certFilePath, program) {
  const cer = path.join(certFilePath, `${publisherName}.cer`)
  const pvk = path.join(certFilePath, `${publisherName}.pvk`)
  const pfx = path.join(certFilePath, `${publisherName}.pfx`)

  const makecert = path.join(program.windowsKit, 'makecert.exe')
  const makecertArgs = ['-r', '-h', '0', '-n', `CN=${publisherName}`, '-eku', '1.3.6.1.5.5.7.3.3', '-pe', '-sv', pvk, cer]

  const pk2pfx = path.join(program.windowsKit, 'pvk2pfx.exe')
  const pk2pfxArgs = ['-pvk', pvk, '-spc', cer, '-pfx', pfx]
  const installPfxArgs = ['Import-PfxCertificate', '-FilePath', pfx, '-CertStoreLocation', '"Cert:\\LocalMachine\\TrustedPeople"']

  // Ensure the target directory exists
  fs.ensureDirSync(certFilePath)

  // Inform the user about the password
  utils.log(chalk.green.bold('When asked to enter a password, please select "None".'))

  return utils.executeChildProcess(makecert, makecertArgs)
    .then(() => utils.executeChildProcess(pk2pfx, pk2pfxArgs))
    .then(() => utils.executeChildProcess('powershell.exe', installPfxArgs))
    .then(() => {
      program.devCert = pfx
      return pfx
    })
}

function signAppx (program) {
  return new Promise((resolve, reject) => {
    if (!program.devCert) {
      utils.debug(`Error: Tried to call signAppx, but program.devCert was undefined`)
      reject('No developer certificate specified!')
    }

    const pfxFile = program.devCert
    const appxFile = path.join(program.outputDirectory, `${program.packageName}.appx`)
    const params = ['sign', '-f', pfxFile, '-fd', 'SHA256', '-v'].concat(program.signtoolParams || [])

    utils.debug(`Using PFX certificate from: ${pfxFile}`)
    utils.debug(`Signing appx package: ${appxFile}`)
    utils.debug(`Using the following parameters for signtool.exe: ${JSON.stringify(params)}`)

    params.push(appxFile)

    utils.executeChildProcess(path.join(program.windowsKit, 'signtool.exe'), params)
      .then(() => resolve())
      .catch((err) => reject(err))
  })
}

module.exports = {
  makeCert,
  signAppx
}
