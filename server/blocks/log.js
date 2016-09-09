const winston = require("winston");

module.exports = function log(...objects) {
    return function (ctx) {
        let logger = ctx.logger || winston.loggers.get("system");

        logger.info(...objects);
        return ctx;
    }
}


