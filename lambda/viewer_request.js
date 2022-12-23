const SOURCE_CONFIG = require(`${__dirname}/config.js`)
const bot = require(`${__dirname}/handlers/bot_handler.js`)
const experiment = require(`${__dirname}/handlers/experiment_handler.js`)
const common = require(`${__dirname}/helpers/common_functions.js`)

exports.handler = async (event, context, callback) => {
  const request = event.Records[0].cf.request
  common.dumpRequest('INITIAL', request)
  bot.detectBots(request, SOURCE_CONFIG)
  experiment.setExperiment(request, SOURCE_CONFIG)
  common.dumpRequest('FINAL', request)
  callback(null, request)
};
