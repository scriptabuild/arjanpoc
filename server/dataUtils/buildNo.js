const fs = require("fs");
const path = require("path");

function getAllBuildNosSync(parentfolder) {
	try {
		var files = fs.readdirSync(parentfolder)
		files = files
			.filter(n => !isNaN(n))
			.filter(file => fs.statSync(path.join(parentfolder, file)).isDirectory());

		if (files.length === 0) {
			return [];
		}
		return files;
	} catch (err) {
		return [];
	}
}

function getLatestBuildNoSync(parentfolder) {
	files = getAllBuildNosSync(parentfolder);
	if (files.length === 0) {
		return 0;
	}
	return Math.max.apply(Math, files);
}



module.exports = {
	getAllBuildNosSync,
	getLatestBuildNoSync
};