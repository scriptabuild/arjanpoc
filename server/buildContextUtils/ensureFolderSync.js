const fs = require("fs");
const path = require("path");


module.exports = function ensureFolderSync(folderPath, mask) {
	let pathParts = createSubpaths(folderPath);
	
	for (let pathPart of pathParts) {
		try {
			if (mask == undefined) {
				mask = 0777;
			}
			fs.mkdirSync(pathPart, mask);
		} catch (err) {
			if (err.code == "EEXIST") continue;
			throw err;
		}
	}
}

function createSubpaths(folderPath) {
	var pathParts = [];
	let pos = 0;
	while ((pos = folderPath.indexOf(path.sep, pos + 1)) > -1) {
		pathParts.push(folderPath.substr(0, pos));
	}
	pathParts.push(folderPath);
	return pathParts;
}