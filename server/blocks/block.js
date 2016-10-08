const Q = require("q");
const winston = require("winston");

module.exports = function (fn, name = "") {
	return function (ctx) {
		let hkey = ctx.hkey.spawn();
        let logger = ctx.logger || winston.loggers.get("system");

		return Q(ctx)
			.then(ctx => {
				logger.info(hkey.key, `┏━━━━ ${name}`);
				return ctx;
			})
			.then(fn)
			.then(() => {
				logger.info(hkey.key, `┗━━━━ ${name}`);
				return ctx;
			})
			.catch(err => {
				logger.error(hkey.key, `┗━━━━ Failed: ${name}`);
				throw err;
			})
	}
}