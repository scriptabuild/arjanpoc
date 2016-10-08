const path = require("path");
const fs = require("fs");

function getStatusSync(projectSandbox, buildNo = 0) {
	if (buildNo === 0) return {
		status: "never built",
		timestamp: null
	};

	let filename = path.join(projectSandbox, buildNo.toString(), "buildstatus.txt");
	let stat = fs.statSync(filename);
	let timestamp = stat.mtime;
	let fd = fs.openSync(filename, "r");
	let status = fs.readFileSync(fd);
	fs.close(fd);

	if (status == "completed") return {
		status: "ok",
		timestamp
	};
	if (status == "started") return {
		status: "running",
		timestamp
	};
	if (!status) return {
		status: "unknown",
		timestamp
	};
	return {
		status: status.toString(),
		timestamp
	};
}

function setStatusSync(projectSandbox, buildNo, status) {
	if (buildNo === undefined) {
		throw new Error("Invalid BuildNo", "No BuildNo specified");
	}

	let filename = path.join(projectSandbox, buildNo.toString(), "buildstatus.txt");
	let fd = fs.openSync(filename, "w");
	fs.writeSync(fd, status);
	fs.close(fd);

}

module.exports = {
	getStatusSync,
	setStatusSync
};