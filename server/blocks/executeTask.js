const {spawn} = require('child_process');
const spawnargs = require('spawn-args');
const Q = require("q");
const _ = require("lodash");
const winston = require("winston");

module.exports = function executeTask(tasks) {
    return function (ctx) {
        let logger = ctx.logger || winston.loggers.get("system");
        let transFn = ctx.transFn || (obj => obj);

        if (Array.isArray(tasks)) {
    		let hkey = ctx.hkey.spawn();

            logger.info(hkey.key, `┏━━━━ Starting child processes`);

            let childCtx = _.assignIn({}, ctx, { hkey });
            let pChain = Q( childCtx );
            for (let task of tasks) {
                var fn = getPreparedExecSpawnFunction(task, transFn);
                pChain = pChain.then(fn);
            }
            return pChain.then(function() {
                logger.info(hkey.key, `┗━━━━ Finished running child processes`);
                return ctx;
            });
        }
        else {
            var fn = getPreparedExecSpawnFunction(tasks, transFn);
            return fn(ctx);
        }
    }
}

function getPreparedExecSpawnFunction(task, transFn) {
    task = transFn(task);
    let {cmd, args, options} = resolveParams(task);
    options = options || {};
    if (!options.cwd) {
        options.cwd = transFn("%build%");
    }
    if (!options.shell) {
        options.shell = true;
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
    return function (ctx) {
        let hkey = ctx.hkey.spawn();
        let logger = ctx.logger || winston.loggers.get("system");

        return Q.promise(function (resolve, reject, notify) {

            logger.info(hkey.key, `┏━━━━ Starting child process`);
            logger.info(hkey.key, `"${cmd} ${args.join(" ")}"`);
            // logger.info({ cmd, args, options });

            const proc = spawn(cmd, args, options);

            proc.stdout.on('data', data => {
                data.toString().split("\n").forEach(line => logger.info(hkey.key, line));
            });

            var message = "";
            proc.stderr.on('data', data => {
                data.toString().split("\n").forEach(line => logger.error(hkey.key, line));

                message += data + "\n";
            });

            proc.on('exit', (code, signal) => {
                if (code == 0) {
                    logger.info(hkey.key, `┗━━━━ Child process exited with code 0`);
                    resolve(ctx);
                } else if(code) {
                    logger.error(hkey.key, `┗━━━━ Child process exited with code ${code}`);
                    reject({ name: "ChildProcessError", message, code });
                } else {
                    logger.error(hkey.key, `┗━━━━ Child process exited with signal "${signal}"`);
                    reject({ name: "ChildProcessError", message, code });
                }
            });

            proc.on('error', err => {
                logger.error(hkey.key, `┗━━━━ Child process failed with error ${err.name} ("${err.message}")`);
                reject({ name: "ChildProcessError", name: err.name, message: err.message });
            });

        });
    }
}

