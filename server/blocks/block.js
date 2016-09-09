const Q = require("q");
const winston = require("winston");

module.exports = function (fn, name = "") {
	return function (ctx) {
		let logger = ctx.logger || winston.loggers.get("system");

		return Q(ctx)
			.then(ctx => {
				logger.info(`┏━━━━ ${name}`);
				return ctx;
			})
			.then(fn)
			.then(ctx => {
				logger.info(`┗━━━━ ${name}`);
				return ctx || ctx;
			})
			.catch(() => logger.error(`┗━━━━ ${name}`));
	}
}