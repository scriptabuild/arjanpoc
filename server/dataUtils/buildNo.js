const fs = require("fs");
const path = require("path");

function getAllBuildNosSync(projectSandbox) {
	try {
		var files = fs.readdirSync(projectSandbox)
		files = files
			.filter(n => !isNaN(n))
			.filter(file => fs.statSync(path.join(projectSandbox, file)).isDirectory());

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
};