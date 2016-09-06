const Q = require("q");
const winston = require("winston");

var logger = winston.loggers.get("system");

module.exports = function (fn, name = "") {
	return function () {
		return Q()
			.then(() => logger.info(`┏━━━━ ${name}`))
			.then(fn)
			.then(() => logger.info(`┗━━━━ ${name}`))
			.catch(() => logger.error(`┗━━━━ ${name}`));
	}
}