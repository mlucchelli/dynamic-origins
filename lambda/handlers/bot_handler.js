// Detect bot users agent
function isBot(val){
  const botTest = new RegExp('bot|crawler|spider|crawling|facebook|twitter|slack|meta|link', 'i')
  return val && botTest.test(val)
}

function isActive(SOURCE_CONFIG){
  return SOURCE_CONFIG.bot && SOURCE_CONFIG.bot.active && SOURCE_CONFIG.bot.botOrigin
}

// Add Bot header for all crawlers
function detectBots(request, SOURCE_CONFIG){
  if(isActive(SOURCE_CONFIG)){
    bot_detected = true
    if(request.headers['user-agent']){
      let userAgent = request.headers['user-agent'][0].value
      bot_detected = isBot(userAgent)
    }
    request.headers[SOURCE_CONFIG.bot.botHeader] = [{ key: SOURCE_CONFIG.bot.botHeader, value: bot_detected.toString()}]
  }
}

// This path should be excluded
function includedPath(currentPath, botincludedPaths){
  if(botincludedPaths){
    var includedPaths = botincludedPaths.split(',')
    for (let path of includedPaths){
      if(new RegExp(path).test(currentPath)){
        return true
      }
    }
  }
  return false
}

//Check if current origin request was flagged as bot
function shouldRedirectBot(request,SOURCE_CONFIG) {
  let bot_detected = false
  if (isActive(SOURCE_CONFIG) && request.headers[SOURCE_CONFIG.bot.botHeader]){
    if (request.headers[SOURCE_CONFIG.bot.botHeader].length > 0){
      bot_detected = (request.headers[SOURCE_CONFIG.bot.botHeader][0].value === 'true')
    }
  }
  return bot_detected
}

function changeHost(request, hostValue)
{
  if(hostValue != ""){
    request.headers['host'] = [ { key: 'Host', value: hostValue } ]
  }
}

//Create URI for bots
function createURI(SOURCE_CONFIG, request)
{
  let queryHack = "?rendertron=true"
  // Clodfront is not adding the query strings from the url properly
  if(request.querystring != "")
    queryHack += '&' + request.querystring

  return SOURCE_CONFIG.bot.botOriginURIPrefix + encodeURIComponent(request.uri + queryHack)
}

//Send request to bot origin if the request was flagged as bot
function handleBots(request, SOURCE_CONFIG){
  if (isActive(SOURCE_CONFIG) && includedPath(request.uri, SOURCE_CONFIG.bot.botPaths)){
    if(shouldRedirectBot(request, SOURCE_CONFIG)){
      request.origin.custom.domainName = SOURCE_CONFIG.bot.botOrigin
      request.origin.custom.port = parseInt(SOURCE_CONFIG.bot.botOriginPort)
      request.origin.custom.protocol = SOURCE_CONFIG.bot.botOriginProtocol
      request.uri = createURI(SOURCE_CONFIG, request)
      changeHost(request, SOURCE_CONFIG.bot.botHost )
      return true
    }
    else{
      //we should set the host equal the domain name for cloudfront redirections
      //TODO lets turn the bot hanlder in a simple xperiment based on headers
      changeHost(request, request.origin.custom.domainName)
    }
  }
  
  return false
}

// Export the functions in order to be used in other files that require this one
module.exports.isBot = isBot
module.exports.detectBots = detectBots
module.exports.shouldRedirectBot = shouldRedirectBot
module.exports.handleBots = handleBots
