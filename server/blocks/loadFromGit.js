const Q = require("q");
const _ = require("lodash");
const winston = require("winston");

const _if = require("./_if");
const {isDirectory} = require("../utils");
const executeTask = require("./executeTask");

var logger = winston.loggers.get("system");

// module.exports = function (source, destination, transFn) {
// 	return function () {
// 		return Q()
// 		    .then(_if(isDirectory(transFn(destination + "/.git")),
// 				executeTask({ cmd: "git", args: ['pull'], options: { cwd: destination } }, transFn),
// 				executeTask({ cmd: "git", args: ['clone', source.url, destination], cwd: "%sandbox%" }, transFn)))
// 			.then(executeTask({ cmd: "git", args: ['checkout', 'HEAD'], options: { cwd: destination } }, transFn));

// 	}
// }