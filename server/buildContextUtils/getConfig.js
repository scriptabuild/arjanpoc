const path = require("path");
const load = require("../dataUtils/load");
const merge = (...objs) => require("deepmerge").all(objs, {arrayMerge: (arr1, arr2) => arr1.concat(arr2) });

module.exports = function getConfig(){

	const defaultConfig = {
		http: {port: 80},
		workingDirectory: "./scrab",
		projectsConfigurationFile: "./projects.json"		
	};
	console.log("default config:\n", defaultConfig);

	let configFilename = path.resolve(process.cwd(), "./scriptabuild.json");
	parseParam("config:", x => configFilename = x);
	const fileConfig = load.json(configFilename);
	console.log("file config:\n", fileConfig);

	const cliConfig = getCliConfig();
	console.log("cli config:\n", cliConfig);

	//const combinedConfig = merge({}, defaultConfig, fileConfig, cliConfig);
	const combinedConfig = Object.assign({}, defaultConfig, fileConfig, cliConfig);


	console.log("combined config:\n", combinedConfig);
	return combinedConfig;
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