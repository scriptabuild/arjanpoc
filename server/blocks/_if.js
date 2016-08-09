const Q = require("q");
const winston = require("winston");

var logger = winston.loggers.get("system");


module.exports = function _if(condition, trueFunc, falseFunc) {
    return function () {
        return Q(condition).then(function (res) {
            if (res) {
                return trueFunc ? trueFunc() : undefined;
            }
            return falseFunc ? falseFunc() : undefined;
        });
    };
}

