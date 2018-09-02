'use strict'

const MODULE_ID = 'BIGVIEW'

exports.log = function (str) {
  console.log(' [' + MODULE_ID + ' LOG]: ' + str)
}

exports.error = function (str) {
  console.error(' [' + MODULE_ID + ' LOG]: ' + str)
}

