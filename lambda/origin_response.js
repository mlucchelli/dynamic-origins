const SOURCE_CONFIG = require(`${__dirname}/config.js`)
const experiment = require(`${__dirname}/handlers/experiment_handler.js`)
const common = require(`${__dirname}/helpers/common_functions.js`)

// Origin Response handler
exports.handler = (event, context, callback) => {
  const request = event.Records[0].cf.request
  const response = event.Records[0].cf.response
  common.dumpRequest('INITIAL', request)
  common.dumpResponse('INITIAL', response)
  experiment.persistResponseCookies(request, response, SOURCE_CONFIG)
  common.dumpResponse('FINAL', response)
  callback(null, response);
}
