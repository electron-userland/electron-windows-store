'use strict'

module.exports = function (program) {
  if (program.finalSay) {
    return Promise.resolve(program.finalSay())
  } else {
    return Promise.resolve()
  }
}
