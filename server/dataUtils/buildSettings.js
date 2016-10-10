const fs = require("fs");
const path = require("path");

function getBuildSettingsSync(projectSandbox, buildNo = 0) {
	if (buildNo === 0) return {
		branch: null,
		commitHash: null
	};

	try {
		let filename = path.join(projectSandbox, buildNo.toString(), "buildsettings.txt");
		let fd = fs.openSync(filename, "r");
		let buildSettings = JSON.parse(fs.readFileSync(fd).toString());
		fs.close(fd);
		return buildSettings;
	} catch (err) {
		return {};
	}
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

function getPathspecSync(projectSandbox, buildNo = 0) {
	if (buildNo === 0) return null;

	try {
		let filename = path.join(projectSandbox, buildNo.toString(), "pathspec.txt");
		let fd = fs.openSync(filename, "r");
		let pathspec = fs.readFileSync(fd).toString();
		fs.close(fd);
		return buildSettings;
	} catch (err) {
		return null;
	}
}

function setPathspecSync(projectSandbox, buildNo, pathspec) {
	if (buildNo === undefined) {
		throw new Error("Invalid BuildNo", "No BuildNo specified");
	}

	let filename = path.join(projectSandbox, buildNo.toString(), "pathspec.txt");
	let fd = fs.openSync(filename, "w");
	fs.writeSync(fd, pathspec);
	fs.close(fd);
}

module.exports = {
	getBuildSettingsSync,
	setBuildSettingsSync,
	getPathspecSync,
	setPathspecSync
};