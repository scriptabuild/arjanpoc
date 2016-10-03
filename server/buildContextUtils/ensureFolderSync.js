const fs = require("fs");

module.exports = function ensureFolderSync(path, mask) {
	let paths = createSubpaths(path);

	for (let path of paths) {
		try {
			if (mask == undefined) {
				mask = 0777;
			}
			fs.mkdirSync(path, mask);
		} catch (err) {
			if (err.code == "EEXIST") continue;
			throw err;
		}
	}
}

function createSubpaths(path) {
	var paths = [];
	let pos = 0;
	while ((pos = path.indexOf("/", pos + 1)) > -1) {
		paths.push(path.substr(0, pos));
	}
	paths.push(path);
	return paths;
}