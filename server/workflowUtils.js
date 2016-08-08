const fs = require("fs");
const Q = require("q");
// const _ = require("lodash");

const globs = require("./globs");


function transform(orig, dictionary, depth) {
    if (orig !== null
        && typeof orig !== "object"
        && typeof (orig) !== "function"
    ) return replace(orig, dictionary);

    // Make the copy share the same prototype as the original
    var copy = new orig.constructor();

    // Copy every enumerable property not from the prototype
    for (var key in orig) {
        if (orig.hasOwnProperty(key)) {
            if (depth === undefined || depth > 0) {
                copy[key] = transform(orig[key], dictionary, depth === undefined ? undefined : depth - 1);
            }
            else {
                copy[key] = orig[key];
            }
        }
    }

    return copy;
}

function replace(s, dictionary) {
    if (typeof s != "string") return s;

    return s.replace(/%(.*?)%/g, function (a, b) {
        return dictionary[b];
    });
}



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
    transform,
    isFile,
    isDirectory
};