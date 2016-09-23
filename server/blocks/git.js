const Q = require("q");
const _ = require("lodash");
const winston = require("winston");
const ensureFolder = require("./ensureFolder");
const _if = require("./_if");
const executeTask = require("./executeTask");
const { isDirectory } = require("../utils")

exports.load = function (project) {
	return function (ctx) {
		let hkey = ctx.hkey.spawn();
		let logger = ctx.logger || winston.loggers.get("system");
		let transFn = ctx.transFn || (obj => obj);

        logger.info(hkey.key, `┏━━━━ Loading from git "${project.source.url}"`);

		let childCtx = _.assignIn({}, ctx, { hkey });
		return Q(childCtx)
			.then(ensureFolder("%build%"))
			.then(_if(isDirectory(transFn("%build%/.git")), () =>
				Q(childCtx)
					.then(executeTask({ cmd: "git", args: ['reset', "--hard"], options: { cwd: "%build%" } }))
					.then(executeTask({ cmd: "git", args: ['pull'], options: { cwd: "%build%" } })),
				executeTask({ cmd: "git", args: ['clone', project.source.url, "%build%"], options: { cwd: "%sandbox%" } })))
			.then(executeTask({ cmd: "git", args: ['checkout', 'HEAD'], options: { cwd: "%build%" } }))
			.then(function () {
				logger.info(hkey.key, `┗━━━━ Loaded from git "${project.source.url}"`);
				return ctx;
			});
	}
}

// exports.tag = function(){
// 	return function(ctx){
// 		return Q(ctx)
// 			.then(executeTask({ cmd: "git", args: ['tag', buildNo], options: { cwd: "%build%" } }))
// 			.then(executeTask({ cmd: "git", args: ['push', 'origin', theTag, commitId], options: { cwd: "%build%" } }))
// 	}
// }