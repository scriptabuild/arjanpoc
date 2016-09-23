const fsx = require("fs-extra");
const Q = require("q");
const _ = require("lodash");
const winston = require("winston");


module.exports = function copyFolder(fromPath, toPath) {
    return function (ctx) {
		let hkey = ctx.hkey.spawn();
        let logger = ctx.logger || winston.loggers.get("system");
        let transFn = ctx.transFn || (obj => obj);
        fromPath = transFn(fromPath);
        toPath = transFn(toPath);

        logger.info(hkey.key, `┏━━━━ Copying folder "${fromPath}" to "${toPath}"`);
        let promise = execCopyFolder(ctx, fromPath, toPath);
        return promise.then(function () {
            logger.info(hkey.key, `┗━━━━ Copied folder "${fromPath}" to "${toPath}"`);
            return ctx;
        });
    }
}

function execCopyFolder(ctx, fromPath, toPath) {
    let logger = ctx.logger || winston.loggers.get("system");

    return Q.promise(function (resolve, reject, progress) {

        fsx.copy(fromPath, toPath, function (err) {
            if (err) {
                // logger.info(`(${ctx.hkey.key})┃  "${path}" Failed creating`), ctx.hkey.key;
                reject(err);
            } else {
                logger.info(ctx.hkey.key, `┃ "${fromPath}" copied to "${toPath}"`);
                resolve();
            }
        });

    });
}

