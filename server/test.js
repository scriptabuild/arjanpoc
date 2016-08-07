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



const config = require("./config");
const projects = require("./projects");

var project = projects[0];
var sandboxDirectory = config.workspaces + "/" + project.name;
var buildscriptsDirectory = sandboxDirectory + "/scripts";
var buildDirectory = sandboxDirectory + "/build";
var dictionary = {
    sandbox: sandboxDirectory,
    scripts: buildscriptsDirectory,
    build: buildDirectory
};
var trans = obj => transform(obj, dictionary, 5);



Q()
    .then(log("Starting Scriptabuild"))
    .then(ensureFolderExists(config.root))
    .then(ensureFolderExists(config.logs))
    .then(ensureFolderExists(config.workspaces))
    
    .then(log("Setting up sandbox for project"))
    .then(ensureFolderExists(sandboxDirectory))
    .then(ensureFolderExists(buildscriptsDirectory))
    .then(ensureFolderExists(buildDirectory))

    .then(log("Loading buildscripts into sandbox"))
    .then(_if(isDirectory(trans("%scripts%/.git")),
        undefined,
        execute({ cmd: "git", args: ['clone', project.source.location, "%scripts%"], cwd: "%sandbox%" }, trans)))
    .then(execute({ cmd: "git", args: ['pull'], cwd: "%scripts%" }, trans))
    .then(execute({ cmd: "git", args: ['checkout', 'HEAD'], cwd: "%scripts%" }, trans))

    .then(log("Starting buildscript"))
    // .then(execute({ cmd: "npm", args: ['update'], cwd: buildscriptsDirectory }, trans))

    .then(execute(project.run, trans))
    .then(log("Scripts completed successfully"))
    .catch(err => console.error("Scripts failed", err));

