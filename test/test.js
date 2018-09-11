const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const mockery = require('mockery')

chai.should()
chai.use(chaiAsPromised)
mockery.enable({ warnOnUnregistered: false })

global.testing = true

// Run tests
require('./lib/assets');
require('./lib/deploy');
require('./lib/makeappx');
require('./lib/makepri');
require('./lib/manifest');
require('./lib/sign');
require('./lib/zip');
require('./lib/utils');
