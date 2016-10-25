
module.exports = function getConfig(){

	// TODO: Get configuration from .rc file? better defaults? cmd line args?
	// TODO: Correctly resolve and combine paths.

	const config = {
		http: {port: (process.argv.find(a => a.indexOf("http.port:")>=0) || "http.port:80").substr(10)},
		workingDirectory: (process.argv.find(a => a.indexOf("workingDirectory:")>=0) || "workingDirectory:./scriptabuild_default/workingdirectory").substr(17),
		projectsConfigurationFile: (process.argv.find(a => a.indexOf("projectsConfigurationFile:")>=0) || "projectsConfigurationFile:./projects").substr(26)
	};
	console.log("config", config);
	return config;
}