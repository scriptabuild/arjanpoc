const winston = require("winston");
const path = require("path");
const ensureFolderSync = require("./ensureFolderSync");
const transform = require("./transform");
const {getProjectSandbox} = require("../dataUtils/projectSandbox");
const {getLatestBuildNoSync} = require("../dataUtils/buildNo");
const HKeyGenerator = require("hkey-generator");


module.exports = function createBuildContext(config, project) {
	let parentfolder = path.join(config.workingDirectory, "workspaces", escape(project.name));

	let buildNo = getLatestBuildNoSync(parentfolder) + 1;
	let output = path.join(parentfolder, buildNo.toString())

	ensureFolderSync(output);

	let paths = {
		parentfolder,
		buildNo,
		build: path.join(parentfolder, "build"),
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
			// new(winston.transports.Console)(),
			new(winston.transports.File)({
				filename
			})
		]
	});
}
