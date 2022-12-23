// Get current experiment from cookie
function getExperimentFromCookie(request, SOURCE_CONFIG){
	if (SOURCE_CONFIG.experiment.experimentCookie){
    const experimentA = `${SOURCE_CONFIG.experiment.experimentCookie}=${SOURCE_CONFIG.experiment.experimentValueA}`
	  const experimentB = `${SOURCE_CONFIG.experiment.experimentCookie}=${SOURCE_CONFIG.experiment.experimentValueB}`
    if (readCookie(request, experimentA)) {
      return SOURCE_CONFIG.experiment.experimentValueA
  	}
	  else if (readCookie(request, experimentB)) {
	   return SOURCE_CONFIG.experiment.experimentValueB
	  }
  }
	console.log("cookie not present")
	return false
}

// Read cookie
function readCookie(request, cookieToSearch){
	console.log("search cookie")
	console.log(cookieToSearch)
	if (request.headers.cookie) {
		for (let cookie of request.headers.cookie) {
			if (cookie.value.indexOf(cookieToSearch) >= 0) {
				return true
			}
		}
	}
	return false
}

// Verify if your experiment should apply in all the paths
function allPathsExperiment(experimentPath){
	return experimentPath == "*"
}

// Check if curent paht is included in the test
function isExperimentPath(uri, experimentPath){
	return allPathsExperiment(experimentPath) || currentPathContains(uri, experimentPath)
}

//check if current path contains string
function currentPathContains(uri, currentPath){
	return (new RegExp(currentPath)).test(uri)
}

// This path should be excluded
function excludedPath(uri, experimentExcludedPaths){
	if(experimentExcludedPaths){
	  var excludedPaths = experimentExcludedPaths.split(',')
	  for (let path of excludedPaths){
		  if(currentPathContains(uri, path)){
			  return true
		  }
	  }
  }
	return false
}

// Check if we already have the experiment cookie
function isAlreadyDecided(request, SOURCE_CONFIG){
	const experimentFromCookie = getExperimentFromCookie(request, SOURCE_CONFIG)
	console.log("experiment from cookie")
	console.log(experimentFromCookie)
	return (experimentFromCookie === SOURCE_CONFIG.experiment.experimentValueA || experimentFromCookie === SOURCE_CONFIG.experiment.experimentValueB)
}

// Shoud we use the experimental branch?
function isB(request, SOURCE_CONFIG){
	const experimentFromHeader = getExperimentFromHeader(request, SOURCE_CONFIG)
	return experimentFromHeader == SOURCE_CONFIG.experiment.experimentValueB
}

// Shoud we use the main branch?
function isA(request, SOURCE_CONFIG){
	return !isB(request, SOURCE_CONFIG)
}

// The experiment is active in the config file
function isActive(SOURCE_CONFIG){
	return SOURCE_CONFIG.experiment && SOURCE_CONFIG.experiment.active
}

// Validated the country if the currenty iso code is defined in the headers and the experiment config
function isCountryAllowed(request, SOURCE_CONFIG){
	return !request.headers['cloudfront-viewer-country'] || !SOURCE_CONFIG.experiment.experimentCountries || SOURCE_CONFIG.experiment.experimentCountries.includes(request.headers['cloudfront-viewer-country'][0].value)
}

//Detect if current request is candidate for an experiment
function detectExperimentSession(request, SOURCE_CONFIG){
	return isActive(SOURCE_CONFIG) && SOURCE_CONFIG.experiment.experimentPath && SOURCE_CONFIG.experiment.experimentAudience && !excludedPath(request.uri, SOURCE_CONFIG.experiment.experimentExcludedPaths)
}

// Get a random number that define your destiny
function decideAlternativeBranch(SOURCE_CONFIG){
	return Math.random() <= SOURCE_CONFIG.experiment.experimentAudience
}

// Save experiment cookies
function setExperimentCookie(request, SOURCE_CONFIG, branchValue){
	if (SOURCE_CONFIG.experiment.experimentCookie){
	  const experimentCookie = `${SOURCE_CONFIG.experiment.experimentCookie}=${branchValue}`
	  //flag this request add a cookie
	  const ExperimentCookieCreated = 'cookie_created=1'
	  request.headers.cookie = request.headers.cookie || []
	  request.headers.cookie.push({ key:'Cookie', value: experimentCookie })
	  request.headers.cookie.push({ key:'Cookie', value: ExperimentCookieCreated })
  }
}

// Get the experiment value from headers, this headers should be whitelisted in cloudfront
function getExperimentFromHeader(request, SOURCE_CONFIG){
	return request.headers[SOURCE_CONFIG.experiment.experimentHeader.toLowerCase()][0].value
}

// Save experiment headers
function setExperimentHeaders(request, SOURCE_CONFIG, branchValue){
	request.headers = request.headers || []
	request.headers[SOURCE_CONFIG.experiment.experimentHeader] = [{ key: SOURCE_CONFIG.experiment.experimentHeader, value: branchValue}];
}

// Set the experiment based on the experimentAudience
function setExperiment(request, SOURCE_CONFIG){
	if(detectExperimentSession(request, SOURCE_CONFIG)){
	  let branchValue = SOURCE_CONFIG.experiment.experimentValueA
	  // We will set the request branch if it wasn't decided in the pass
	  if (!isAlreadyDecided(request, SOURCE_CONFIG)){
		  if(decideAlternativeBranch(SOURCE_CONFIG)){
			  branchValue = SOURCE_CONFIG.experiment.experimentValueB
		  }
		  setExperimentCookie(request, SOURCE_CONFIG, branchValue)
		  setExperimentHeaders(request, SOURCE_CONFIG, branchValue)
	  }
	  else{
	  	setExperimentHeaders(request, SOURCE_CONFIG, getExperimentFromCookie(request, SOURCE_CONFIG))
	  }
  }
}

// Retunr the expiration date from config
function getExpirationDate(SOURCE_CONFIG){
	let expirationDate = ''
	if(SOURCE_CONFIG.experiment.experimentExpirationDate){
		let expiration = new Date(SOURCE_CONFIG.experiment.experimentExpirationDate).toUTCString()
		expirationDate = `; expires=${expiration}`
	}
	return expirationDate
}

//Determine if we should switch origin
function shouldChangeOrigin(request, SOURCE_CONFIG){
	if(!isCountryAllowed(request, SOURCE_CONFIG)){
		// we remove the experiment decision if the counry is not allowed
		setExperimentCookie(request, SOURCE_CONFIG, SOURCE_CONFIG.experiment.experimentValueA)
		return false
	}
	return detectExperimentSession(request, SOURCE_CONFIG) && isB(request, SOURCE_CONFIG) && isExperimentPath(request.uri, SOURCE_CONFIG.experiment.experimentPath)
}

function shouldPersistCookiInResponse(request, SOURCE_CONFIG){
	return SOURCE_CONFIG.experiment && isActive(SOURCE_CONFIG) &&!excludedPath(request.uri, SOURCE_CONFIG.experiment.experimentExcludedPaths) && isCountryAllowed(request, SOURCE_CONFIG) && SOURCE_CONFIG.experiment.experimentCookie
}

// Add set-cookie header to the current cookies or create a new one
function assingSetCookieHeader(response, cookie)
{
  if(!response.headers['set-cookie'])
  {
	  response.headers['set-cookie'] = []
  }
  
  response.headers['set-cookie'].push({ key: "Set-Cookie", value: cookie})
}

// Persist cloudfront experiment cookies in the user response
function persistResponseCookies(request, response, SOURCE_CONFIG){
	if(shouldPersistCookiInResponse(request,SOURCE_CONFIG)){
		const expirationDate = getExpirationDate(SOURCE_CONFIG)
		const experimentA = `${SOURCE_CONFIG.experiment.experimentCookie}=${SOURCE_CONFIG.experiment.experimentValueA}${expirationDate}; path=/`
		const experimentB = `${SOURCE_CONFIG.experiment.experimentCookie}=${SOURCE_CONFIG.experiment.experimentValueB}${expirationDate}; path=/`
		const experimentFromHeader = getExperimentFromHeader(request, SOURCE_CONFIG)

		//Check if cookie was created
		const cookieCreated = readCookie(request, 'cookie_created=1')
		if (experimentFromHeader == SOURCE_CONFIG.experiment.experimentValueA && cookieCreated) {
			console.log('ADD A Cookie')
			assingSetCookieHeader(response, experimentA)
		}
		else if (experimentFromHeader == SOURCE_CONFIG.experiment.experimentValueB && cookieCreated) {
			console.log('ADD B Cookie')
			assingSetCookieHeader(response, experimentB)
		}
	}
}

//Send request to experiment origin
function handleExperiments(request, SOURCE_CONFIG){
	if(shouldChangeOrigin(request, SOURCE_CONFIG)){
		request.origin.custom.domainName = SOURCE_CONFIG.experiment.experimentOrigin

		if(!request.origin.custom || SOURCE_CONFIG.experiment.experimentOriginHost != "")
		{
		  request.headers['host'] = [ { key: 'host', value: SOURCE_CONFIG.experiment.experimentOriginHost } ]
		  console.log('host modified')
	  }

	  if(SOURCE_CONFIG.experiment.experimentOriginPath != "")
		{
		  request.origin.custom.path = SOURCE_CONFIG.experiment.experimentOriginPath
	  }
		return true
	}
	return false
}

// Export the functions in order to be used in other files that require this one
module.exports.isExperimentPath = isExperimentPath
module.exports.detectExperimentSession = detectExperimentSession
module.exports.setExperiment = setExperiment
module.exports.isB = isB
module.exports.isA = isA
module.exports.handleExperiments = handleExperiments
module.exports.persistResponseCookies = persistResponseCookies