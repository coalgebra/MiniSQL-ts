"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ASTType;
(function (ASTType) {
    ASTType[ASTType["BP"] = 0] = "BP";
    ASTType[ASTType["NT"] = 1] = "NT";
    ASTType[ASTType["ID"] = 2] = "ID";
    ASTType[ASTType["NL"] = 3] = "NL";
    ASTType[ASTType["SL"] = 4] = "SL";
    ASTType[ASTType["IN"] = 5] = "IN";
})(ASTType = exports.ASTType || (exports.ASTType = {}));
var AST = /** @class */ (function () {
    function AST(astType) {
        this.astType = astType;
    }
    AST.prototype.evaluate = function (map) {
        return true;
    };
    return AST;
}());
exports.AST = AST;
var IsNullAST = /** @class */ (function (_super) {
    __extends(IsNullAST, _super);
    function IsNullAST(value) {
        var _this = _super.call(this, ASTType.IN) || this;
        _this.value = value;
        return _this;
    }
    IsNullAST.prototype.evaluate = function (map) {
        if (this.value.evaluate(map)) {
            return true;
        }
        return false;
    };
    return IsNullAST;
}(AST));
exports.IsNullAST = IsNullAST;
var BINOP;
(function (BINOP) {
    BINOP[BINOP["AN"] = 0] = "AN";
    BINOP[BINOP["OR"] = 1] = "OR";
    BINOP[BINOP["EQ"] = 2] = "EQ";
    BINOP[BINOP["NE"] = 3] = "NE";
    BINOP[BINOP["GT"] = 4] = "GT";
    BINOP[BINOP["LS"] = 5] = "LS"; // LESS
})(BINOP = exports.BINOP || (exports.BINOP = {}));
var BinopAST = /** @class */ (function (_super) {
    __extends(BinopAST, _super);
    function BinopAST(op, left, right) {
        var _this = _super.call(this, ASTType.BP) || this;
        _this.op = op;
        _this.left = left;
        _this.right = right;
        return _this;
    }
    BinopAST.prototype.evaluate = function (map) {
        var lhs = this.left.evaluate(map);
        var rhs = this.right.evaluate(map);
        switch (this.op) {
            case BINOP.AN:
                if (typeof lhs === "boolean" && typeof rhs === "boolean") {
                    return lhs && rhs;
                }
                return null;
            case BINOP.OR:
                if (typeof lhs === "boolean" && typeof rhs === "boolean") {
                    return lhs || rhs;
                }
                return null;
            case BINOP.EQ:
                return lhs === rhs;
            case BINOP.NE:
                return lhs !== rhs;
            case BINOP.GT:
                if (typeof lhs === "number" && typeof rhs === "number") {
                    return lhs > rhs;
                }
                if (typeof lhs === "string" && typeof rhs === "string") {
                    return lhs > rhs;
                }
                return null;
            case BINOP.LS:
                if (typeof lhs === "number" && typeof rhs === "number") {
                    return lhs > rhs;
                }
                if (typeof lhs === "string" && typeof rhs === "string") {
                    return lhs > rhs;
                }
                return null;
        }
        return null;
    };
    return BinopAST;
}(AST));
exports.BinopAST = BinopAST;
var IdAST = /** @class */ (function (_super) {
    __extends(IdAST, _super);
    function IdAST(name) {
        var _this = _super.call(this, ASTType.ID) || this;
        _this.name = name;
        return _this;
    }
    IdAST.prototype.evaluate = function (map) {
        if (Object.hasOwnProperty(this.name)) {
            return Object[this.name];
        }
        return null;
    };
    return IdAST;
}(AST));
exports.IdAST = IdAST;
var NumLitAST = /** @class */ (function (_super) {
    __extends(NumLitAST, _super);
    function NumLitAST(value) {
        var _this = _super.call(this, ASTType.NT) || this;
        _this.value = value;
        return _this;
    }
    NumLitAST.prototype.evaluate = function (map) {
        return this.value;
    };
    return NumLitAST;
}(AST));
exports.NumLitAST = NumLitAST;
var StrLitAST = /** @class */ (function (_super) {
    __extends(StrLitAST, _super);
    function StrLitAST(value) {
        var _this = _super.call(this, ASTType.SL) || this;
        _this.value = value;
        return _this;
    }
    StrLitAST.prototype.evaluate = function (map) {
        return this.value;
    };
    return StrLitAST;
}(AST));
exports.StrLitAST = StrLitAST;
var NotAST = /** @class */ (function (_super) {
    __extends(NotAST, _super);
    function NotAST(value) {
        var _this = _super.call(this, ASTType.NT) || this;
        _this.value = value;
        return _this;
    }
    NotAST.prototype.evaluate = function (map) {
        var temp = this.value.evaluate(map);
        if (typeof temp === "boolean") {
            return !temp;
        }
        return null;
    };
    return NotAST;
}(AST));
exports.NotAST = NotAST;
function createLiteral(value) {
    if (typeof value === "string") {
        return new StrLitAST(value);
    }
    else {
        return new NumLitAST(value);
    }
}
exports.createLiteral = createLiteral;
//# sourceMappingURL=ast.js.map