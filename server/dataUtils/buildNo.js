const fs = require("fs");
const path = require("path");

function getAllBuildNosSync(config, project) {
	var sandbox = config.workspaces + "/" + escape(project.name);
	try {
		var files = fs.readdirSync(sandbox)
		files = files
			.filter(n => !isNaN(n))
			.filter(file => fs.statSync(path.join(sandbox, file)).isDirectory());

		if (files.length === 0) {
			return 0;
		}
		return files;
	} catch (err) {
		return [];
	}
}

function getLatestBuildNoSync(config, project) {
	files = getAllBuildNosSync(config, project);
	if (files.length === 0) {
		return 0;
	}
	return Math.max.apply(Math, files);
}



module.exports = {
	getAllBuildNosSync,
	getLatestBuildNoSync
}