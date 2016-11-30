const fs = require("fs");
const path = require("path");

function json(filename) {
	try {
		let fd = fs.openSync(filename, "r");
		let data = JSON.parse(fs.readFileSync(fd).toString());
		fs.close(fd);
		return data;
	} catch (err) {
		return undefined;
	}
}

module.exports = {
	json
}