const fs = require("fs");
const Q = require("q");
const winston = require("winston");

function asStatus(status) {
    return function (ctx) {
        let logger = ctx.logger || winston.loggers.get("system");

        let transFn = ctx.transFn;

        logger.info(`┏━━━━ marking ${ctx.project.name} as ${status}`);

        let filename = transFn(`%output%/buildstatus.txt`);
        let fd = fs.openSync(filename, "a");
        fs.writeSync(fd, status);
        fs.close(fd);

        logger.info(`┗━━━━ Marked ${ctx.project.name} as ${status}`);
        return ctx
    }
}

exports.asCompleted = function () {
    return asStatus("completed");
}

exports.asFailed = function () {
    return asStatus("failed");
}
