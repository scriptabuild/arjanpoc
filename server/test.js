const fs = require("fs");
const spawn = require('child_process').spawn;
const Q = require("q");

const config = require("./config");
const projects = require("./projects");

var project = projects[0];
var sandboxDirectory = config.workspaces + "/" + project.name;
var buildscriptsDirectory = sandboxDirectory + "/scripts";
var buildDirectory = sandboxDirectory + "/build";
var dictionary = {scripts: buildscriptsDirectory, build: buildDirectory};
var transformFunc = obj => transform(obj, dictionary, 5);

Q()
    .then(ensureFolderExists(config.root))
    .then(ensureFolderExists(config.logs))
    .then(ensureFolderExists(config.workspaces))
    .then(log("Setting up sandbox for project", project))
    .then(ensureFolderExists(sandboxDirectory))
    .then(log("Downloading scripts", project))
    .then(execute({cmd: "git", args: ['clone', project.source.location, "%scripts%"]}, { cwd: sandboxDirectory }, transformFunc))
    .then(log("Downloading dependencies for script", project))
    .then(execute({cmd: "npm", args: ['update']}, { cwd: buildscriptsDirectory }, transformFunc))
    .then(log("So far so good!"))
    .then(ensureFolderExists(buildDirectory))
    .then(execute(project.run[0], { cwd: buildDirectory }, transformFunc))
    .then(log("DONE!!!"));



// Building blocks for async build processes
function transform(orig, dictionary, depth) {

    // Value types are already copies here, so they don't need to be cloned.
    if (orig !== null
        && typeof orig !== "object"
        && typeof (orig) !== "function"
    ) return replace(orig, dictionary);

    // Make the clone share the same prototype as the original
    var copy = new orig.constructor();

    // Copy every enumerable property not from the prototype
    for (var key in orig) {
        if (orig.hasOwnProperty(key)) {
            if (depth === undefined || depth > 0) {
                copy[key] = transform(orig[key], dictionary, depth === undefined ? undefined : depth - 1);
            }
            else {
                copy[key] = orig[key];
            }
        }
    }

    return copy;
}

function replace(s, dictionary) {
    return s.replace(/%(.*?)%/g, function (a, b) {
        return dictionary[b];
    });
}

function log(...objects) {
    return function () {
        console.log(...objects);
    }
}

function ensureFolderExists(path, mask) {
    return function () {
        console.info("┏━━ Creating folder", path);
        return Q.promise(function (resolve, reject, progress) {
            if (mask == undefined) {
                mask = 0777;
            }
            fs.mkdir(path, mask, function (err) {
                if (err && err.code != "EEXIST") {
                    console.error("┗━━ Failed at creating folder", path);
                    reject(err);
                } else {
                    console.info("┗━━ Created folder", path);
                    resolve(path);
                }
            });

        });
    }
}

function execute(task, options, transformFunc) {
    return function () {
        return Q.promise(function (resolve, reject, notify) {
            task = transformFunc(task);
            console.info("┏━━ Starting external process", task, options);
            const proc = spawn(task.cmd, task.args, options);

            proc.stdout.on('data', data => {
                // TODO: This should go to log file
                console.log(`stdout: ${data}`);
            });

            proc.stderr.on('data', data => {
                // TODO: This should go to log file
                console.log(`stderr: ${data}`);
            });

            proc.on('close', code => {
                console.log(`┗━━ Child process exited with code ${code}`, task, options);
                resolve(code);
            });

        });
    }
}

