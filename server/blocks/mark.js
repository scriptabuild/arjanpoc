const { setStatusSync } = require("../dataUtils/status");
const fs = require("fs");
const winston = require("winston");

function asStatus(status) {
    return function (ctx) {
		let hkey = ctx.hkey.spawn();
        let logger = ctx.logger || winston.loggers.get("system");

        let transFn = ctx.transFn;

        logger.info(hkey.key, `┏━━━━ Marking ${ctx.project.name} as ${status}`);

        setStatusSync(ctx.paths.sandbox, ctx.paths.buildNo, status);

        logger.info(hkey.key, `┗━━━━ Marked ${ctx.project.name} as ${status}`);
        return ctx
    }
}

exports.asStarted = function () {
    return asStatus("started");
}

exports.asCompleted = function () {
    return asStatus("completed");
}

exports.asFailed = function () {
    return asStatus("failed");
}
