const Q = require("q");
const winston = require("winston");

var logger = winston.loggers.get("system");

module.exports = function (fn, name = "") {
	return function (config) {
		return Q()
			.then(() => logger.info(`┏━━━━ ${name}`))
			.then(fn)
			.then(() => {
				logger.info(`┗━━━━ ${name}`);
				return config;
			})
			.catch(() => logger.error(`┗━━━━ ${name}`));
	}
}