const Q = require("q");
const winston = require("winston");

var logger = winston.loggers.get("system");


module.exports = function _if(condition, trueFunc, falseFunc) {
    return function (buildCtx) {
        return Q(condition).then(function (res) {
            if (res) {
                return trueFunc ? trueFunc(buildCtx) : undefined;
            }
            return falseFunc ? falseFunc(buildCtx) : undefined;
        });
    };
}

