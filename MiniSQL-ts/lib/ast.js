"use strict";
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
class AST {
    constructor(astType) { this.astType = astType; }
    evaluate(map) {
        return true;
    }
}
exports.AST = AST;
class IsNullAST extends AST {
    constructor(value) {
        super(ASTType.IN);
        this.value = value;
    }
    evaluate(map) {
        if (this.value.evaluate(map)) {
            return true;
        }
        return false;
    }
}
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
class BinopAST extends AST {
    constructor(op, left, right) {
        super(ASTType.BP);
        this.op = op;
        this.left = left;
        this.right = right;
    }
    evaluate(map) {
        const lhs = this.left.evaluate(map);
        const rhs = this.right.evaluate(map);
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
    }
}
exports.BinopAST = BinopAST;
class IdAST extends AST {
    constructor(name) {
        super(ASTType.ID);
        this.name = name;
    }
    evaluate(map) {
        let pos = -1;
        for (let i = 0; i < map[0].members.length; i++) {
            if (map[0].members[i].index === this.name) {
                pos = i;
                break;
            }
        }
        if (pos === -1) {
            throw `Can't find property of table ${map[0].name}`;
        }
        return map[1].value[pos];
    }
}
exports.IdAST = IdAST;
class NumLitAST extends AST {
    constructor(value) {
        super(ASTType.NT);
        this.value = value;
    }
    evaluate(map) {
        return this.value;
    }
}
exports.NumLitAST = NumLitAST;
class StrLitAST extends AST {
    constructor(value) {
        super(ASTType.SL);
        this.value = value;
    }
    evaluate(map) {
        return this.value;
    }
}
exports.StrLitAST = StrLitAST;
class NotAST extends AST {
    constructor(value) {
        super(ASTType.NT);
        this.value = value;
    }
    evaluate(map) {
        let temp = this.value.evaluate(map);
        if (typeof temp === "boolean") {
            return !temp;
        }
        return null;
    }
}
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