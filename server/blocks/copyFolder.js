const fsx = require("fs-extra");
const Q = require("q");
const _ = require("lodash");
const winston = require("winston");

var logger = winston.loggers.get("system");


module.exports = function copyFolder(fromPath, toPath, transformFunc = obj => obj) {
    return function () {
        fromPath = transformFunc(fromPath);
        toPath = transformFunc(toPath);

        logger.info(`┏━━━━ Copying folder "${fromPath}" to "${toPath}"`);
        let promise = execCopyFolder(fromPath, toPath);
        return promise.then(function () {
            logger.info(`┗━━━━ Copied folder "${fromPath}" to "${toPath}"`);
        });
    }
}

function execCopyFolder(fromPath, toPath) {
    return Q.promise(function (resolve, reject, progress) {

        fsx.copy(fromPath, toPath, function (err) {
            if (err) {
                // logger.info(`┃  "${path}" Failed creating`);
                reject(err);
            } else {
                logger.info(`┃ "${fromPath}" copied to "${toPath}"`);
                resolve();
            }
        });

    });
}

