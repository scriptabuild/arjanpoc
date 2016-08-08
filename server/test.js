const Q = require("q");
const {
    ensureFolderExists,
    execute,
    log,
    _if
} = require("./workflowParts")
const {
    transform,
    isFile,
    isDirectory
} = require("./workflowUtils")
const winston = require("winston");
const globs = require("./globs");


const config = require("./config");
const projects = require("./projects");

var project = projects[0];
var sandbox = config.workspaces + "/" + project.name;
var scripts = sandbox + "/scripts";
var build = sandbox + "/build";
var paths = {
    sandbox,
    scripts,
    build
};

var transFn = obj => transform(obj, paths, 10);

//TODO: Ensure log folder exists
//TODO: Seperate logs for system and project (per project and timestamp - record timestamp, script commit id, project commit id)
globs.logger = new winston.Logger({
    transports: [
        new winston.transports.Console(),
        // new winston.transports.File({ filename: `${config.logs}/${project.name}/logfile.txt` })
    ]
});


Q()
    .then(log("Starting Scriptabuild"))
    .then(ensureFolderExists(config.root))
    .then(ensureFolderExists(config.logs))
    .then(ensureFolderExists(config.workspaces))

    .then(log("Setting up sandbox for project"))
    .then(ensureFolderExists(sandbox))
    .then(ensureFolderExists(scripts))
    .then(ensureFolderExists(build))

    .then(log("Loading buildscripts into sandbox"))
    // .then(ensureDownloadResource(project.source))
    .then(_if(isDirectory(transFn("%scripts%/.git")),
        undefined,
        execute({ cmd: "git", args: ['clone', project.source.params, "%scripts%"], cwd: "%sandbox%" }, transFn)))
    .then(execute({ cmd: "git", args: ['pull'], options: { cwd: "%scripts%" } }, transFn))
    .then(execute({ cmd: "git", args: ['checkout', 'HEAD'], options: { cwd: "%scripts%" } }, transFn))

    .then(log("Starting buildscript"))
    .then(execute(project.run, transFn))
    .then(log("Scripts completed successfully"))
    .catch(err => console.error("Scripts failed", err));

