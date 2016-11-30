const fs = require("fs");
const Q = require("q");
const _ = require("lodash");
const winston = require("winston");

module.exports = function ensureFolder(path) {
    return function (ctx) {
		let hkey = ctx.hkey.spawn();
        let logger = ctx.logger || winston.loggers.get("system");
        let transFn = ctx.transFn || (obj=>obj);
        path = transFn(path);

        logger.info(hkey.key, `┏━━━━ Creating "${path}" folder`);

        let paths = createSubpaths(path);

        let pChain = Q(ctx);
        for (let path of paths) {
            var fn = execCreateFolder(ctx, path);
            pChain = pChain.then(fn);
        }
        return pChain.then(function () {
            logger.info(hkey.key, `┗━━━━ Created "${path}" folder`);
            return ctx;
        });
    }
}

function createSubpaths(path) {
    var paths = [];
    let pos = 0;
    while ((pos = path.indexOf("/", pos + 1)) > -1) {
        paths.push(path.substr(0, pos));
    }
    paths.push(path);
    return paths;
}

function execCreateFolder(ctx, path, mask) {
    return function () {
        let hkey = ctx.hkey;
        let logger = ctx.logger || winston.loggers.get("system");
        
        return Q.promise(function (resolve, reject, progress) {
            if (mask == undefined) {
                mask = 0777;
            }
            fs.mkdir(path, mask, function (err) {
                if (err && err.code == "EEXIST") {
                    resolve(path);
                } else if (err) {
                    reject(err);
                } else {
                    logger.info(hkey.key, `"${path}" created`);
                    resolve(path);
                }
            });

        });
    }
}

