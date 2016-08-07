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
                return trueFunc ? trueFunc(): undefined;
            }
            return falseFunc ? falseFunc(): undefined;
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

function execute(task, transformFunc = obj => obj) {
    return function () {
        if (Array.isArray(task)) {

            var p = Q();
            for (var t of task) {
                p = p.then(execute(t, transformFunc));
            }
            return p;
        }

        return Q.promise(function (resolve, reject, notify) {
            if (typeof task == "string") {
                var args = spawnargs(task);

                task = {
                    cmd: _.head(args),
                    args: _.tail(args)
                };
            }

            task = transformFunc(task);
            console.info("┏━━━━ Starting external process");
            console.info("┃ ", task);

            let cwd = task.cwd || transformFunc("%build%");
            const proc = spawn(task.cmd, task.args, {cwd});

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