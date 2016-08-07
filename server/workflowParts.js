const fs = require("fs");
const {spawn} = require('child_process');
const spawnargs = require('spawn-args');
const Q = require("q");
const _ = require("lodash");



function log(...objects) {
    return function () {
        console.log(...objects);
    }
}


function _if(condition, trueFunc, falseFunc) {
    return function () {
        return Q(condition).then(function (res) {
            if (res) {
                return trueFunc ? trueFunc() : undefined;
            }
            return falseFunc ? falseFunc() : undefined;
        });
    };
}

function ensureFolderExists(path, mask) {
    return function () {
        console.info("┏━━━━ Creating folder");
        console.info("┃ ", path);
        return Q.promise(function (resolve, reject, progress) {
            if (mask == undefined) {
                mask = 0777;
            }
            fs.mkdir(path, mask, function (err) {
                if (err && err.code == "EEXIST") {
                    console.info("┗━━━━ Folder already exists");
                    resolve(err);
                } else if (err) {
                    console.error("┗━━━━ Failed at creating folder");
                    reject(err);
                } else {
                    console.info("┗━━━━ Created folder");
                    resolve(path);
                }
            });

        });
    }
}

function execute(tasks, transformFunc = obj => obj) {
    return function () {
        if (Array.isArray(tasks)) {
            let pChain = Q();
            for (let task of tasks) {
                var fn = getFunction(task, transformFunc);
                pChain = pChain.then(fn);
            }
            return pChain;
        }
        else {
            var fn = getFunction(tasks, transformFunc);
            return fn();
        }
    }
}

function getFunction(task, transformFunc) {
    task = transformFunc(task);
    let {cmd, args, options} = resolveParams(task);
    options = options || {};
    if(!options.cwd){
        options.cwd = transformFunc("%build%");
    }
    return runSpawn(cmd, args, options);
}

function resolveParams(task) {
    if (typeof task == "string") {
        var args = spawnargs(task);

        task = {
            cmd: _.head(args),
            args: _.tail(args)
        };
        return task;
    }

    return task;
}

function runSpawn(cmd, args, options) {
    return function () {
        return Q.promise(function (resolve, reject, notify) {

            console.info("┏━━━━ Starting external process");
            console.info("┃ ", cmd, args, options);

            // let cwd = task.cwd || transformFunc("%build%");
            const proc = spawn(cmd, args, options);

            proc.stdout.on('data', data => {
                // TODO: This should go to log file
                // console.log(`stdout: ${data}`);
            });

            var message = "";
            proc.stderr.on('data', data => {
                // TODO: This should go to log file
                // console.log(`stderr: ${data}`);
                message += data;

            });

            proc.on('close', code => {
                if (code == 0) {
                    console.log(`┗━━━━ Child process exited with code ${code}`);
                    resolve(code);
                } else {
                    console.error(`┗━━━━ Child process exited with code ${code}`);
                    reject({ name: "ChildProcessError", message, code });
                }
            });

        });
    }
}


module.exports = {
    log,
    _if,
    ensureFolderExists,
    execute
};