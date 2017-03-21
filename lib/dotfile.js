'use strict'

const path = require('path')
const merge = require('lodash.merge')
const fs = require('fs')
const e = process.env

let root = e.USERPROFILE || e.APPDATA || e.TMP || e.TEMP || e.HOME || e.PWD || '/tmp'

function Config () {
  if (!(this instanceof Config)) {
    return new Config('.electron-windows-store')
  }

  this.path = path.join(root, '.electron-windows-store')
}

Config.prototype.get = function () {
  try {
    return JSON.parse(fs.readFileSync(this.path, 'utf8'))
  } catch (err) {
    return {}
  }
}

Config.prototype.set = function (config) {
  if (e.USER === 'root') {
    return
  }
  var properties = this.get()
  properties = merge(properties, config)
  try {
    fs.writeFileSync(this.path, JSON.stringify(properties, null, 2) + '\n')
  } catch (err) {
  }
}

Config.prototype.append = function (property, value) {
  if (e.USER === 'root') {
    return
  }

  var data = this.get()
  data[property] = value

  try {
    fs.writeFileSync(this.path, JSON.stringify(data, null, 2) + '\n')
  } catch (err) {
  }
}

module.exports = Config
