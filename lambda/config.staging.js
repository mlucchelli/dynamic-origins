module.exports = {
	"experiment":{
		"experimentPath": "*",
		"experimentExcludedPaths": "system,asset,.json",
		"experimentAudience": "0.5", //50%
		"experimentName": "experiment name",
		"experimentCookie": "cookie name",
		"experimentHeader": "X-header-for-your-experiment",
		"experimentValueA": "false",
		"experimentValueB": "true",
		"experimentOrigin": "EXPERIMENT URL HERE",
		"experimentOriginHost": "",
		"experimentOriginPath": "",
		"experimentCountries": "AR", // Country code
		"experimentExpirationDate": "2023-3-05 00:00:00 EST",
		"active": false
	},
	"bot":{
		"botHeader": "x-bot",
		'botPaths': "the path were you want to detect bots",
		"botOrigin": "BOTs Origin URL",
		'botHost': "BOTs Host",
		"botOriginPort": "80",
		"botOriginProtocol": "http",
		"botOriginURIPrefix": "Prefix in case is needed",
		"active": true
	}
}
