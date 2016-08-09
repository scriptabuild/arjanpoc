const winston = require("winston");

var logger = winston.loggers.get("system");


module.exports = function log(...objects) {
    return function () {
        logger.info(...objects);
    }
}


