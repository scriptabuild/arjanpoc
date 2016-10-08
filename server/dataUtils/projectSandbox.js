const path = require("path");

function getProjectSandbox(config, project) {
	return path.join(config.workingDirectory, "workspaces", escape(project.name));
}

module.exports = {
	getProjectSandbox
};