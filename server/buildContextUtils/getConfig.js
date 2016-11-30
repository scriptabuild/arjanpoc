const load = require("../dataUtils/load");

module.exports = function getConfig(){

	const defaultConfig = {
		http: {port: 80},
		workingDirectory: "scriptabuild_default/workingdirectory",
		projectsConfigurationFile: "projects.json"		
	};

	let configFilename = "scriptabuild.json";
	parseParam("config:", x => configFilename = x);
	const fileConfig = load.json(configFilename);

	const cliConfig = getCliConfig();

	const resultingConfig = Object.assign({}, defaultConfig, fileConfig, cliConfig);

	console.log("config", resultingConfig);
	return resultingConfig;
}

function parseParam(prefix, cb){
	let x = process.argv.find(a => a.indexOf(prefix)>=0);
	if(x !== undefined){
		cb(x.substr(prefix.length));
	}
}

function getCliConfig(){
	const cliConfig = {};
	
	parseParam("http.port:", x => cliConfig.http = {port: x});
	parseParam("workingDirectory:", x => cliConfig.workingDirectory = x);
	parseParam("projectsConfigurationFile:", x => cliConfig.projectsConfigurationFile = x);
	
	return cliConfig;
}