const fs = require("fs");
const {spawn} = require('child_process');
const spawnargs = require('spawn-args');
const Q = require("q");
const _ = require("lodash");

const globs = require("./globs");



function log(...objects) {
    return function () {
        console.log(...objects);
        globs.logger.log('info', ...objects);
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
        globs.logger.log('info', `ensureFolderExist(${path})`);

        console.info("┏━━━━ Creating folder");
        console.info("┃ ", path);
        return Q.promise(function (resolve, reject, progress) {
            if (mask == undefined) {
                mask = 0777;
            }
            fs.mkdir(path, mask, function (err) {
                if (err && err.code == "EEXIST") {
                    console.info("┗━━━━ Folder already exists");
                    globs.logger.log('info', `${path} already exists`);
                    resolve(err);
                } else if (err) {
                    console.error("┗━━━━ Failed at creating folder");
                    globs.logger.log('error', `creating ${path} failed`);
                    reject(err);
                } else {
                    globs.logger.log('info', `${path} created successfully`);
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
                var fn = getPreparedExecSpawnFunction(task, transformFunc);
                pChain = pChain.then(fn);
            }
            return pChain;
        }
        else {
            var fn = getPreparedExecSpawnFunction(tasks, transformFunc);
            return fn();
        }
    }
}

function getPreparedExecSpawnFunction(task, transformFunc) {
    task = transformFunc(task);
    let {cmd, args, options} = resolveParams(task);
    options = options || {};
    if (!options.cwd) {
        options.cwd = transformFunc("%build%");
    }
    return runSpawn(cmd, args, options);
}

// task can be either a string or an object. This function transforms the task to a params object.
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

            globs.logger.log('info', `Spawning process: ${cmd} ${args.join(" ")}, options: ${JSON.stringify(options)}`);

            const proc = spawn(cmd, args, options);

            proc.stdout.on('data', data => {
                // console.log(`stdout: ${data}`);
                globs.logger.log('verbose', `${data}`);
            });

            var message = "";
            proc.stderr.on('data', data => {
                // console.log(`stderr: ${data}`);
                globs.logger.log('warn', `${data}`);

                message += data;
            });

            proc.on('close', code => {
                if (code == 0) {
                    console.log(`┗━━━━ Child process exited with code ${code}`);
                    globs.logger.log('info', `Child process exited with code ${code}`);                
                    resolve(code);
                } else {
                    console.error(`┗━━━━ Child process exited with code ${code}`);
                    globs.logger.log('error', `Child process exited with code ${code}`);                
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