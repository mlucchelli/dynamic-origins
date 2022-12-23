// Dump the request, header and cookies
function dumpRequest(step, request){
  console.log(`${step} REQUEST`)
  console.log(request)
  console.log(`${step} REQUEST HEADERS`)
  console.log(request.headers)
  console.log(`${step} REQUEST COOKIES`)
  console.log(request.headers.cookie)
}

function dumpResponse(step, response){
  console.log(`${step} RESPONSE`)
  console.log(response)
  console.log(`${step} RESPONSE HEADERS`)
  console.log(response.headers)
  console.log(`${step} RESPONSE COOKIES`)
  console.log(response.headers.cookie)
}

module.exports.dumpRequest = dumpRequest
module.exports.dumpResponse = dumpResponse
