var log = console.log;

log("Scriptabuild engine starting...");

const _ = require("lodash");
const fs = require("fs");

const config = require("./config")
const projects = require("./projects");


exports.runSandbox = function (projectId) {
	var projectConfig = getprojectConfig(projectId);

    // TODO: Setup stdio to correct files for THIS project and version (timestamp + commitId)

	ensureFolderExists(__dirname + `/sandbox-${projectConfig.name}`, 0744, function (err) {
		if (err) console.log("Failed to create sandbox:", err);
	});
	
	gitPullOrClone(projectConfig.source.location, commitId);

	runBefore(projectConfig.before);
	run(projectConfig.run);
	runAfter(projectConfig.after);
};

function getProjectConfig(projectId) {
	return _(projects).filter({ projectId })
}

function ensureFolderExists(path, mask, cb) {
    if (typeof mask == 'function') {
        cb = mask;
        mask = 0777;
    }
    fs.mkdir(path, mask, function (err) {
        if (err) {
            if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
            else cb(err); // something else went wrong
        } else cb(null); // successfully created folder
    });
}

function gitPullOrClone(params) {
    // 1. determine wether or not to clone repo
    // 2. git pull/git checkout to get correct version
}


function run(scripts) {
    // TODO: exec() - Abort on error, log to stdio etc.
}