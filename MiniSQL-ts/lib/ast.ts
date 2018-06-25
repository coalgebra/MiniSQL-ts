import {Table, TableHeader } from "./tables";
import {Record} from "./records";

export enum ASTType{
    BP, // BINOP
    NT, // NOT
    ID, // IDENT
    NL, // NUMBER LITERAL
    SL, // STRING LITERAL
    IN, // IS NULL
}

export type ValueType = boolean | string | number;

export class AST {
    astType: ASTType;
    constructor(astType: ASTType) { this.astType = astType; }
    evaluate(map: [TableHeader, Record]) : ValueType {
        return true;
    }
}

export class IsNullAST extends AST {
    value: AST;
    constructor(value: AST) {
        super(ASTType.IN);
        this.value = value;
    }

    evaluate(map: [TableHeader, Record]): ValueType {
        if (this.value.evaluate(map)) {
            return true;
        }
        return false;
    }
}


export enum BINOP {
    AN, // AND
    OR, // OR
    EQ, // EQUAL
    NE, // NOT EQUAL
    GT, // GREATER
    LS // LESS
}

export class BinopAST extends AST {
    op: BINOP;
    left: AST;
    right: AST;

    constructor(op: BINOP, left: AST, right: AST) {
        super(ASTType.BP);
        this.op = op;
        this.left = left;
        this.right = right;
    }

    evaluate(map: [TableHeader, Record]): boolean {
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
                    return lhs < rhs;
                }
                if (typeof lhs === "string" && typeof rhs === "string") {
                    return lhs < rhs;
                }
                return null;
        }
        return null;
    }
}

export class IdAST extends AST{
    name: string;

    constructor(name: string) {
        super(ASTType.ID);
        this.name = name;
    }

    evaluate(map: [TableHeader, Record]): string | number {
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
        return map[1].value[pos] as string | number;
    }
}

export class NumLitAST extends AST {
    value: number;

    constructor(value: number) {
        super(ASTType.NT);
        this.value = value;
    }

    evaluate(map: [TableHeader, Record]): number {
        return this.value;
    }
}

export class StrLitAST extends AST {
    value: string;

    constructor(value: string) {
        super(ASTType.SL);
        this.value = value;
    }

    evaluate(map: [TableHeader, Record]): string {
        return this.value;
    }
}

export class NotAST extends AST {
    value: AST;

    constructor(value: AST) {
        super(ASTType.NT);
        this.value = value;
    }

    evaluate(map: [TableHeader, Record]): boolean {
        let temp = this.value.evaluate(map);
        if (typeof temp === "boolean") {
            return !temp;
        }
        return null;
    }
}

export function createLiteral(value : number | string) : AST {
    if (typeof value === "string") {
        return new StrLitAST(value);
    } else {
        return new NumLitAST(value);
    }
}
