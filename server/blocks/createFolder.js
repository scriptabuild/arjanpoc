const fs = require("fs");
const Q = require("q");
const _ = require("lodash");
const winston = require("winston");

var logger = winston.loggers.get("system");


module.exports = function createFolder(path, transformFunc = obj => obj) {
    return function () {
        logger.info(`┏━━━━ Creating folder "${path}"`);

        path = transformFunc(path);
        let paths = createSubpaths(path);

        let pChain = Q();
        for (let path of paths) {
            var fn = execCreateFolder(path);
            pChain = pChain.then(fn);
        }
        return pChain.then(function () {
            logger.info(`┗━━━━ Created "${path}" folder`);
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

function execCreateFolder(path, mask) {
    return function () {
        return Q.promise(function (resolve, reject, progress) {
            if (mask == undefined) {
                mask = 0777;
            }
            fs.mkdir(path, mask, function (err) {
                if (err && err.code == "EEXIST") {
                    // logger.info(`┃ "${path}" Already exists`);
                    resolve(path);
                } else if (err) {
                    // logger.info(`┃  "${path}" Failed creating`);
                    reject(err);
                } else {
                    logger.info(`┃ "${path}" Created`);
                    resolve(path);
                }
            });

        });
    }
}

