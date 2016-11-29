const fs = require("fs");

module.exports = function ensureFolderSync(path, mask) {
	let paths = createSubpaths(path);

	console.log("*** delimiter: " + path.delimiter);
	for(let path in paths){
		console.log("- " + path);
	}
	
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
	while ((pos = path.indexOf(path.delimiter, pos + 1)) > -1) {
		paths.push(path.substr(0, pos));
	}
	paths.push(path);
	return paths;
}