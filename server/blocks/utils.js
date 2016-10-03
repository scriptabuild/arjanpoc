const fs = require("fs");
const Q = require("q");

function isFile(path) {
    return Q.promise(function (resolve) {
        fs.stat(path, function (err, stats) {
            if (err) {
                resolve(false);
            }
            resolve(stats.isFile())
        })
    })
}

function isDirectory(path) {
    return Q.promise(function (resolve) {
        fs.stat(path, function (err, stats) {
            if (err) {
                resolve(false);
            }
            else {
                resolve(stats.isDirectory())
            }
        })
    })
}

module.exports = {
    isFile,
    isDirectory
};