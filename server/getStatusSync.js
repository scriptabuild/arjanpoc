const path = require("path");
const fs = require("fs");

module.exports = function getStatusSync(config, project, buildNo = 0) {
	if (buildNo === 0) return {
		status: "never built",
		timestamp: null
	};
	var sandbox = config.workspaces + "/" + escape(project.name);

	let filename = path.join(sandbox, buildNo.toString(), "buildstatus.txt");
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