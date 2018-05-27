"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BasicType;
(function (BasicType) {
    BasicType[BasicType["INT"] = 0] = "INT";
    BasicType[BasicType["FLOAT"] = 1] = "FLOAT";
    BasicType[BasicType["CHARS"] = 2] = "CHARS";
})(BasicType = exports.BasicType || (exports.BasicType = {}));
function parseType(type) {
    switch (type[0]) {
        case "i":
            return new IntType();
        case "f":
            return new FloatType();
        case "c":
            return new CharsType(parseInt(type.substr(5, type.length - 6)));
        default:
            return null;
    }
}
exports.parseType = parseType;
class IntType {
    constructor() {
        this.btype = BasicType.INT;
    }
    getSize() {
        return 4;
    }
    toString() {
        return "int";
    }
}
exports.IntType = IntType;
class FloatType {
    constructor() {
        this.btype = BasicType.FLOAT;
    }
    getSize() {
        return 8;
    }
    toString() {
        return "float";
    }
}
exports.FloatType = FloatType;
class CharsType {
    constructor(count) {
        this.btype = BasicType.CHARS;
        this.btype = BasicType.CHARS;
        this.count = count;
    }
    getSize() {
        return this.count;
    }
    toString() {
        return `char(${this.count})`;
    }
}
exports.CharsType = CharsType;
//# sourceMappingURL=types.js.map