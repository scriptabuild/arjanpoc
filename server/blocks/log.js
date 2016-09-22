const winston = require("winston");

module.exports = function log(...objects) {
    return function (ctx) {
        let hkey = ctx.hkey;
        let logger = ctx.logger || winston.loggers.get("system");

        logger.info(ctx.hkey.key, ...objects);
        return ctx;
    }
}


