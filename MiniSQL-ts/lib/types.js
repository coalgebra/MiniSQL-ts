"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BasicType;
(function (BasicType) {
    BasicType[BasicType["INT"] = 0] = "INT";
    BasicType[BasicType["FLOAT"] = 1] = "FLOAT";
    BasicType[BasicType["CHARS"] = 2] = "CHARS";
})(BasicType = exports.BasicType || (exports.BasicType = {}));
var IntType = /** @class */ (function () {
    function IntType() {
        this.btype = BasicType.INT;
    }
    return IntType;
}());
exports.IntType = IntType;
var FloatType = /** @class */ (function () {
    function FloatType() {
        this.btype = BasicType.FLOAT;
    }
    return FloatType;
}());
exports.FloatType = FloatType;
var CharsType = /** @class */ (function () {
    function CharsType(count) {
        this.btype = BasicType.CHARS;
        this.btype = BasicType.CHARS;
        this.count = count;
    }
    return CharsType;
}());
exports.CharsType = CharsType;
//# sourceMappingURL=types.js.map