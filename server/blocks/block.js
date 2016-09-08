const Q = require("q");
const winston = require("winston");

var logger = winston.loggers.get("system");

module.exports = function (fn, name = "") {
	return function (buildCtx) {
		return Q(buildCtx)
			.then(ctx => {
				logger.info(`┏━━━━ ${name}`);
				return ctx;
			})
			.then(fn)
			.then(ctx => {
				logger.info(`┗━━━━ ${name}`);
				return ctx || buildCtx;
			})
			.catch(() => logger.error(`┗━━━━ ${name}`));
	}
}