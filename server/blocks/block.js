const Q = require("q");
const winston = require("winston");

var logger = winston.loggers.get("system");

module.exports = function (fn, name = "") {
	return function (buildCtx) {
		// TODO: Add support for flowing buildCtx into fn()
		return Q()
			.then(() => logger.info(`┏━━━━ ${name}`))
			.then(fn)
			.then(() => {
				logger.info(`┗━━━━ ${name}`);
				return buildCtx;
			})
			.catch(() => logger.error(`┗━━━━ ${name}`));
	}
}