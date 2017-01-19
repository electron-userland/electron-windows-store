'use strict'

module.exports = function (program) {
  return new Promise((resolve, reject) => {
    if (program.finalSay) {
      return Promise.resolve(program.finalSay())
    } else {
      return Promise.resolve()
    }
  })
}
