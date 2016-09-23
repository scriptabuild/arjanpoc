const winston = require("winston");

module.exports = function log(...objects) {
    return function (ctx) {
        let hkey = ctx.hkey.spawn();
        let logger = ctx.logger || winston.loggers.get("system");

        logger.info(hkey.key, ...objects);
        return ctx;
    }
}


