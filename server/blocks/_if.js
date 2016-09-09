const Q = require("q");

module.exports = function _if(condition, trueFunc, falseFunc) {
    return function (ctx) {
        return Q(condition).then(function (res) {
            if (res) {
                return trueFunc ? trueFunc(ctx) : undefined;
            }
            return falseFunc ? falseFunc(ctx) : undefined;
        });
    };
}

