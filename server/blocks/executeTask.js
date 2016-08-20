const {spawn} = require('child_process');
const spawnargs = require('spawn-args');
const Q = require("q");
const _ = require("lodash");
const winston = require("winston");

var logger = winston.loggers.get("system");


module.exports = function executeTask(tasks, transformFunc = obj => obj) {
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

            logger.info("┏━━━━ Starting external process");
            logger.info(`┃ "${cmd} ${args.join(" ")}"`, {options});
            // logger.info({ cmd, args, options });

            const proc = spawn(cmd, args, options);

            proc.stdout.on('data', data => {
                logger.info({ stdout: `${data}` });
            });

            var message = "";
            proc.stderr.on('data', data => {
                logger.info({ stderr: `${data}` });

                message += data;
            });

            proc.on('close', code => {
                if (code == 0) {
                    logger.info(`┗━━━━ Child process exited with code ${code}`);
                    resolve(code);
                } else {
                    logger.error(`┗━━━━ Child process exited with code ${code}`);
                    reject({ name: "ChildProcessError", message, code });
                }
            });

        });
    }
}

