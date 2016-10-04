

module.exports = function getLogSync(config, project, buildNo = 0) {
	if (buildNo === 0) return [];
	var sandbox = config.workspaces + "/" + escape(project.name);

	let filename = path.join(sandbox, buildNo.toString(), "log.txt");

	let log = fs.readFileSync(filename).toString().split("\n")
		.filter(line => line)
		.map(line => JSON.parse(line));

	return log;
}
