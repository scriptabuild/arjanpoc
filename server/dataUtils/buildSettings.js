const fs = require("fs");
const path = require("path");

function getBuildSettingsSync(projectSandbox, buildNo = 0) {
	if (buildNo === 0) return {
		branch: null,
		commitHash: null
	};

	let filename = path.join(projectSandbox, buildNo.toString(), "buildsettings.txt");
	let fd = fs.openSync(filename, "r");
	let buildSettings = JSON.parse(fs.readFileSync(fd).toString());
	fs.close(fd);

	return buildSettings;
}

function setBuildSettingsSync(projectSandbox, buildNo, buildSettings) {
	if (buildNo === undefined) {
		throw new Error("Invalid BuildNo", "No BuildNo specified");
	}

	let filename = path.join(projectSandbox, buildNo.toString(), "buildsettings.txt");
	let fd = fs.openSync(filename, "w");
	fs.writeSync(fd, JSON.stringify(buildSettings));
	fs.close(fd);
}

module.exports = {
	getBuildSettingsSync,
	setBuildSettingsSync
};