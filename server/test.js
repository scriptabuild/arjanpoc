const fs = require("fs");
const spawn = require('child_process').spawn;
const Q = require("q");

const ep = require("./engine")

const config = require("./config");
const projects = require("./projects");

var project = projects[0];
var sandboxDirectory = config.workspaces + "/" + project.name;
var buildscriptsDirectory = sandboxDirectory + "/scripts";
var buildDirectory = sandboxDirectory + "/build";
var dictionary = { scripts: buildscriptsDirectory, build: buildDirectory };
var transformFunc = obj => ep.transform(obj, dictionary, 5);

Q()
    .then(ep.ensureFolderExists(config.root))
    .then(ep.ensureFolderExists(config.logs))
    .then(ep.ensureFolderExists(config.workspaces))
    .then(ep.log("Setting up sandbox for project", project))
    .then(ep.ensureFolderExists(sandboxDirectory))
    .then(ep.log("Downloading scripts", project))
// --- begin git stuff
    // .then(ep.execute({ cmd: "git", args: ['-C', 'scripts', 'pull', '||', 'git', 'clone', project.source.location, "%scripts%"] }, { cwd: sandboxDirectory }, transformFunc))
    // .then(ep.execute({ cmd: "git", args: ['clone', project.source.location, "%scripts%"] }, { cwd: sandboxDirectory }, transformFunc))
    .then(ep.execute({ cmd: "git", args: ['pull'] }, { cwd: buildscriptsDirectory }, transformFunc))
    .then(ep.execute({ cmd: "git", args: ['checkout', 'HEAD'] }, { cwd: buildscriptsDirectory }, transformFunc))
// --- end git stuff
    .then(ep.log("Downloading dependencies for script", project))
    .then(ep.execute({ cmd: "npm", args: ['update'] }, { cwd: buildscriptsDirectory }, transformFunc))
    .then(ep.log("So far so good!"))
    .then(ep.ensureFolderExists(buildDirectory))
    .then(ep.execute(project.run, { cwd: buildDirectory }, transformFunc))
    .then(ep.log("Scripts completed successfully"))
    .catch(err => console.error("Scripts failed", err));

