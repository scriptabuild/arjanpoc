var exec = require('child_process').exec;
const Q = require("q");
const _ = require("lodash");
const winston = require("winston");
const ensureFolder = require("./ensureFolder");
const _if = require("./_if");
const executeTask = require("./executeTask");
const { isDirectory } = require("./utils");
const { setBuildSettingsSync, setPathspecSync } = require("../dataUtils/buildSettings");

exports.load = function (project, pathspec = "HEAD") {
	return function (ctx) {
		let hkey = ctx.hkey.spawn();
		let logger = ctx.logger || winston.loggers.get("system");
		let transFn = ctx.transFn || (obj => obj);

        logger.info(hkey.key, `┏━━━━ Loading from git "${project.source.url}"`);

		// TODO: specify branch and commitHash when preparing resources from git
		setPathspecSync(ctx.paths.sandbox, ctx.paths.buildNo, pathspec)

		let childCtx = _.assignIn({}, ctx, { hkey });
		return Q(childCtx)
			.then(ensureFolder("%build%"))
			.then(_if(isDirectory(transFn("%build%/.git")),

				// true
				() => Q(childCtx)
					.then(executeTask({ cmd: "git", args: ['reset', "--hard"], options: { cwd: "%build%" } }))
					.then(executeTask({ cmd: "git", args: ['pull'], options: { cwd: "%build%" } })),
			
				// false
				executeTask({ cmd: "git", args: ['clone', project.source.url, "%build%"], options: { cwd: "%sandbox%" } })))
			
			.then(executeTask({ cmd: "git", args: ['checkout', pathspec], options: { cwd: "%build%" } }))
			.then(function () {

				exec("git rev-parse --short HEAD", { cwd: ctx.paths.build }, function (err, stdout, stderr) {
					let commitHash = stdout.split('\n').join('');
					exec("git rev-parse --abbrev-ref HEAD", { cwd: ctx.paths.build }, function (err, stdout, stderr) {
						let branch = stdout.split('\n').join('');
						setBuildSettingsSync(ctx.paths.sandbox, ctx.paths.buildNo, {commitHash, branch});
					});
				})
				
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