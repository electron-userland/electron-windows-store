'use strict'

const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')

const utils = require('./utils')

function copyTemplate(program) {
  if (!program.manifest) {
    return Promise.resolve()
  }

  // Let's copy in the new manifest
  utils.log(chalk.bold.green('Overwriting manifest...'))

  const source = path.normalize(program.manifest)
  const destination = path.join(program.outputDirectory, 'pre-appx', 'AppXManifest.xml')

  utils.debug(`Copying manifest from ${source} to ${destination}`)

  return fs.copy(source, destination)
    .catch((err) => {
      utils.debug(`Could not overwrite manifest. Error: ${JSON.stringify(err)}`)
      return Promise.reject(err)
    })
}

function loadManifest(program) {
  return fs.readFile(program.manifest)
    .then(buffer => {
      var {name, publisher, version} = parseManifestIdentityTag(buffer.toString())
      program.identityName = program.identityName || name
      program.packageName = program.packageName || program.identityName || name
      program.publisher = program.publisher || publisher
      program.packageVersion = program.packageVersion || version
    })
}

function parseManifestIdentityTag(manifestXml) {
  var match = manifestXml.match(/<Identity.*?\/>/g)
  if (match === null)
    return {}
  var tag = match[0]
  var parsedObj = {}
  tag.slice(9, -2)
    .trim()
    .split(' ')
    .forEach(pairString => {
      var [key, val] = pairString.trim().slice(0, -1).split('="')
      parsedObj[key.toLowerCase()] = val
    })
  return parsedObj
}

async function bumpVersion(program) {
  try {
    var manifestXml = (await fs.readFile(program.manifest)).toString()
    var manifestVersion = parseManifestIdentityTag(manifestXml).version
  } catch(err) {
    throw new Error(`Couldn't find or load AppxManifest.xml file at ${program.manifest}`)
  }

  if (program.bumpType && program.bumpType !== 'revision') {
    // TODO: get version field from package.json, check if this version is greater than
    // the one in manifest. Pick the greater version, increment it and write it to both
    // manifest and package.json
  }

  var newVersion = bumpVersionString(manifestVersion, program.bumpType)
  var newManifest = manifestXml.replace(`Version="${manifestVersion}"`, `Version="${newVersion}"`)
  return fs.writeFile(program.manifest, newManifest)
}

function bumpVersionString(version, type = 'revision') {
  var [major, minor, build, revision] = version.split('.').map(string => parseInt(string))
  switch (type) {
    case 'major':
      major++
      minor = build = revision = 0
      break
    case 'minor':
      minor++
      build = revision = 0
      break
    case 'build':
      build++
      revision = 0
      break
    case 'revision':
    default:
      revision++
  }
  return [major, minor, build, revision]
    // Filter out revision which is undefined in case of package.json's semver versioning style.
    .filter(v => v !== undefined)
    // Put it back toghether into a string form.
    .join('.')
}

module.exports = {copyTemplate, loadManifest, bumpVersion}
