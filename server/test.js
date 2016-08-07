const Q = require("q");
const {
    ensureFolderExists,
    ensureGitCommit,
    execute,
    transform,
    log
} = require("./engine")

const config = require("./config");
const projects = require("./projects");

var project = projects[0];
var sandboxDirectory = config.workspaces + "/" + project.name;
var buildscriptsDirectory = sandboxDirectory + "/scripts";
var buildDirectory = sandboxDirectory + "/build";
var dictionary = { scripts: buildscriptsDirectory, build: buildDirectory };
var transformFunc = obj => transform(obj, dictionary, 5);

Q()
    .then(ensureFolderExists(config.root))
    .then(ensureFolderExists(config.logs))
    .then(ensureFolderExists(config.workspaces))
    .then(log("Setting up sandbox for project"/*, project*/))
    .then(ensureFolderExists(sandboxDirectory))
    .then(log("Downloading scripts"/*, project*/))
// --- begin git stuff
    // .then(ensureGitCommit(project.source.location, "%scripts%", sandboxDirectory, "HEAD", transformFunc))

    .then(() => execute({ cmd: "git", args: ['clone', project.source.location, "%scripts%"] }, { cwd: sandboxDirectory }, transformFunc)().catch(log("*** CLONE TWICE (2)")))
    .then(execute({ cmd: "git", args: ['pull'] }, { cwd: buildscriptsDirectory }, transformFunc))
    .then(execute({ cmd: "git", args: ['checkout', 'HEAD'] }, { cwd: buildscriptsDirectory }, transformFunc))
// --- end git stuff
    .then(log("Downloading dependencies for script" /*, project*/))
    .then(execute({ cmd: "npm", args: ['update'] }, { cwd: buildscriptsDirectory }, transformFunc))
    .then(log("So far so good!"))
    .then(ensureFolderExists(buildDirectory))
    .then(execute(project.run, { cwd: buildDirectory }, transformFunc))
    .then(log("Scripts completed successfully"))
    .catch(err => console.error("Scripts failed", err));

