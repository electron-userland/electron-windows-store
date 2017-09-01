'use strict'

const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')

const utils = require('./utils')

const isValidPublisherName = (function () {
  // MakeCert looks like it accepts RFC1779 / X.500 distinguished names
  // See https://msdn.microsoft.com/en-us/library/windows/apps/br211441.aspx
  //     https://msdn.microsoft.com/en-us/library/aa366101
  //     http://www.itu.int/rec/T-REC-X.520-198811-S/en
  //
  // However, in practice there seem to be some discepencies, such as not supported comma/space escaping,
  // so we adapt this to match the observed behavior of makecert.exe.
  const validKeyPatterns = [
    'CN',            // commonName
    'OU',            // organizationalUnitName
    'O',             // organizationName
    'STREET',        // streetAddress
    'L',             // localityName
    'ST',            // stateOrProvinceName
    'C',             // countryName
    'DC',            // domainComponent
    'SN',            // surname
    'GN',            // given name
    'E',             // email
    'S',             // (non-standard) "State" used by MS Identity objects
    'T',             // ?? Title / telephone
    'G',             // ?? generationQualifier
    'I',             // ?? IP Address
    'SERIALNUMBER',  // serialNumber
    '(?:OID\\.(0|[1-9][0-9]*)(?:\\.(0|[1-9][0-9]*))+)'   // Object IDentifier by explicit numeric code
  ]
  const validKeyPattern = validKeyPatterns.join('|')
  const doubleQuotedPatternWithoutEmbeddedDoubleQuote = '"[^"\\\\]*(?:[^"][^"\\\\]*)*"'
  const validKeyValuePairPattern = `(${validKeyPattern})=((?:${doubleQuotedPatternWithoutEmbeddedDoubleQuote})|[^,"]*)`
  const validSequencePattern = `${validKeyValuePairPattern}(:?\\s*[,;]\\s*${validKeyValuePairPattern})*,?`
  const validDNRegex = new RegExp(`^${validSequencePattern}$`, 'i')

  return function isValidPublisherName (publisherName) {
    return typeof publisherName === 'string' &&
      (publisherName.length === 0 || validDNRegex.test(publisherName))
  }
}())

function makeCert (parametersOrPublisherName, certFilePath, program) {
  let publisherName
  let certFileName
  let install = true

  // We accept both an object and a string here - a string was used
  // in the first release of electron-windows-store, while the object
  // was added later to allow additional flexibility for consuming apps.
  if (typeof parametersOrPublisherName === 'string') {
    publisherName = parametersOrPublisherName
  } else {
    publisherName = parametersOrPublisherName.publisherName
    certFilePath = parametersOrPublisherName.certFilePath
    certFileName = parametersOrPublisherName.certFileName || publisherName
    program = parametersOrPublisherName.program
    if (typeof parametersOrPublisherName.install === 'boolean') {
      install = parametersOrPublisherName.install
    }
  }

  if (typeof publisherName !== 'string') {
    throw new Error('publisherName must be a string')
  }

  if (!isValidPublisherName(publisherName)) {
    publisherName = `CN=${publisherName}`
  }

  certFilePath = certFilePath || ''
  const cer = path.join(certFilePath, `${certFileName}.cer`)
  const pvk = path.join(certFilePath, `${certFileName}.pvk`)
  const pfx = path.join(certFilePath, `${certFileName}.pfx`)

  const makecertExe = path.join(program.windowsKit, 'makecert.exe')
  const makecertArgs = ['-r', '-h', '0', '-n', publisherName, '-eku', '1.3.6.1.5.5.7.3.3', '-pe', '-sv', pvk, cer]

  const pk2pfx = path.join(program.windowsKit, 'pvk2pfx.exe')
  const pk2pfxArgs = ['-pvk', pvk, '-spc', cer, '-pfx', pfx]
  const installPfxArgs = ['Import-PfxCertificate', '-FilePath', pfx, '-CertStoreLocation', '"Cert:\\LocalMachine\\TrustedPeople"']

  // Ensure the target directory exists
  fs.ensureDirSync(certFilePath)

  // If the private key file doesn't exist, makecert.exe will generate one and prompt user to set password
  if (!fs.existsSync(pvk)) {
    utils.log(chalk.green.bold('When asked to enter a password, please select "None".'))
  }

  return utils.executeChildProcess(makecertExe, makecertArgs)
    .then(() => utils.executeChildProcess(pk2pfx, pk2pfxArgs))
    .then(() => {
      if (install) {
        utils.executeChildProcess('powershell.exe', installPfxArgs)
      }
    })
    .then(() => {
      program.devCert = pfx
      return pfx
    })
}

function signAppx (program) {
  return new Promise((resolve, reject) => {
    if (!program.devCert) {
      utils.debug(`Error: Tried to call signAppx, but program.devCert was undefined`)
      reject(new Error('No developer certificate specified!'))
    }

    const pfxFile = program.devCert
    const appxFile = path.join(program.outputDirectory, `${program.packageName}.appx`)
    let params = ['sign', '-f', pfxFile, '-fd', 'SHA256', '-v']
    if (program.certPass) {
      params.push('-p', program.certPass)
    }

    params = params.concat(program.signtoolParams || [])

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
  isValidPublisherName,
  makeCert,
  signAppx
}
