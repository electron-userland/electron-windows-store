const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const mockery = require('mockery')

chai.should()
chai.use(chaiAsPromised)
mockery.enable({ warnOnUnregistered: false })

global.testing = true

// Run tests
const assets = require('./lib/assets');
const deploy = require('./lib/deploy');
const flatten = require('./lib/flatten');
const makeappx = require('./lib/makeappx');
const manifest = require('./lib/manifest');
const sign = require('./lib/sign');
const zip = require('./lib/zip');
const utils = require('./lib/utils');