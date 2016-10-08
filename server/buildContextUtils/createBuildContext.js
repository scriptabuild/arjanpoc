const winston = require("winston");
const path = require("path");
const ensureFolderSync = require("./ensureFolderSync");
const transform = require("./transform");
const {getProjectSandbox} = require("../dataUtils/projectSandbox");
const {getLatestBuildNoSync} = require("../dataUtils/buildNo");
const HKeyGenerator = require("hkey-generator");


module.exports = function createBuildContext(config, project) {
	let sandbox = path.join(config.workingDirectory, "workspaces", escape(project.name));

	let buildNo = getLatestBuildNoSync(sandbox) + 1;
	let output = path.join(sandbox, buildNo.toString())

	ensureFolderSync(output);

	let paths = {
		sandbox,
		buildNo,
		build: path.join(sandbox, "build"),
		output
	};

	let ctx = {
		hkey: new HKeyGenerator([]),
		project,
		paths,
		logger: getLogger(`${output}/log.txt`),
		transFn: obj => transform(obj, paths, 10)
	};

	return ctx;
}

function getLogger(filename) {
	return new(winston.Logger)({
		level: "info",
		transports: [
			new(winston.transports.Console)(),
			new(winston.transports.File)({
				filename
			})
		]
	});
}
