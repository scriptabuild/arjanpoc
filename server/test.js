const Q = require("q");
const createFolder = require("./blocks/createFolder");
const executeTask = require("./blocks/executeTask");
const log = require("./blocks/log");
const _if = require("./blocks/_if");
const {
    transform,
    isFile,
    isDirectory
} = require("./utils")
const winston = require("winston");


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
var logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: "error" }),
        // new winston.transports.File({ filename: `${config.logs}/${project.name}/logfile.json`, level: "silly"})
    ]
});

winston.loggers.add("system");

Q()
    .then(log("Starting Scriptabuild"))
    .then(createFolder(config.logs))
    .then(createFolder(config.workspaces))

    .then(log("Setting up sandbox for project"))
    .then(createFolder(sandbox))
    .then(createFolder(scripts))
    .then(createFolder(build))

    .then(log("Loading buildscripts into sandbox"))
    // .then(ensureDownloadResource(project.source))
    .then(_if(isDirectory(transFn("%scripts%/.git")),
        executeTask({ cmd: "git", args: ['pull'], options: { cwd: "%scripts%" } }, transFn),
        executeTask({ cmd: "git", args: ['clone', project.source.url, "%scripts%"], cwd: "%sandbox%" }, transFn)))
    .then(executeTask({ cmd: "git", args: ['checkout', 'HEAD'], options: { cwd: "%scripts%" } }, transFn))

    .then(log("Starting buildscript"))
    .then(executeTask(project.run, transFn))
    .then(log("Scripts completed successfully"))
    .catch(err => console.error("Scripts failed", err));

