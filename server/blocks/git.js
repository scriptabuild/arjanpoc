const Q = require("q");
const winston = require("winston");
const _if = require("./_if");
const executeTask = require("./executeTask");
const {
    // transform,
    // isFile,
    isDirectory
} = require("../utils")

var logger = winston.loggers.get("system");

exports.load = function (project) {
	return function (buildCtx) {
		let transFn = buildCtx.transFn || (obj=>obj);
		
        logger.info(`┏━━━━ Loading from git "${project.source.url}"`);
		var tlog = logger.info;
		logger.info = msg => tlog("┃ " + msg);

		return Q(buildCtx)
			.then(_if(isDirectory(transFn("%build%/.git")),() =>
				Q(buildCtx)
					.then(executeTask({ cmd: "git", args: ['reset', "--hard"], options: { cwd: "%build%" } }))
					.then(executeTask({ cmd: "git", args: ['pull'], options: { cwd: "%build%" } })),
				executeTask({ cmd: "git", args: ['clone', project.source.url, "%build%"], options: { cwd: "%sandbox%" } })))
			.then(executeTask({ cmd: "git", args: ['checkout', 'HEAD'], options: { cwd: "%build%" } }))
			.then(function(){
				logger.info = tlog;
		        logger.info(`┗━━━━ Loaded from git "${project.source.url}"`);
				return buildCtx;
			});
	}
}

// exports.tag = function(){
// 	return function(buildCtx){
// 		return Q(buildCtx)
// 			.then(executeTask({ cmd: "git", args: ['tag', buildNo], options: { cwd: "%build%" } }))
// 			.then(executeTask({ cmd: "git", args: ['push', 'origin', theTag, commitId], options: { cwd: "%build%" } }))
// 	}
// }