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

exports.load = function (project, transFn) {
	return function () {
        logger.info(`┏━━━━ Loading from git "${project.source.url}"`);
		var tlog = logger.info;
		logger.info = msg => tlog("┃ " + msg);
		return Q()
			.then(_if(isDirectory(transFn("%build%/.git")),() =>
				Q()
					.then(executeTask({ cmd: "git", args: ['reset', "--hard"], options: { cwd: "%build%" } }, transFn))
					.then(executeTask({ cmd: "git", args: ['pull'], options: { cwd: "%build%" } }, transFn)),
				executeTask({ cmd: "git", args: ['clone', project.source.url, "%build%"], options: { cwd: "%sandbox%" } }, transFn)))
			.then(executeTask({ cmd: "git", args: ['checkout', 'HEAD'], options: { cwd: "%build%" } }, transFn))
			.then(function(){
				logger.info = tlog;
		        logger.info(`┗━━━━ Loaded from git "${project.source.url}"`);
			});
	}
}

exports.tag = function(){
	return function(){
		return Q();
		// TODO: code to create a git tag
	}
}