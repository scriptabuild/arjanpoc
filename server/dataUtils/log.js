const path = require("path");
const fs = require("fs");

function getLogSync(projectSandbox, buildNo = 0) {
	if (buildNo === 0) return [];

	let filename = path.join(projectSandbox, buildNo.toString(), "log.txt");

	let log = fs.readFileSync(filename).toString().split("\n")
		.filter(line => line)
		.map(line => JSON.parse(line));

	return log;
}


module.exports = {
	getLogSync
};