import instruction = require("./instruction");
import Instruction = instruction.Instruction;
import Tokenizer = require("./tokenizer");
import Select = instruction.Select;
import Delete = instruction.Delete;
import DropIndex = instruction.DropIndex;
import DropTable = instruction.DropTable;
import CreateIndex = instruction.CreateIndex;
import CreateTable = instruction.CreateTable;
import Insert = instruction.Insert;
import Ast = require("./ast");
import AST = Ast.AST;
import BINOP = Ast.BINOP;

enum TokenType {
    KEYWORD,
    NUMBER,
    STRING,
    IDENT,
    OPERATOR
};

function getTokenType(token: string): TokenType {
    if (!token) {
        throw "pass null value into getTokenType()";
    }
    switch (token) {
        case "select":
        case "create":
        case "delete":
        case "drop":
        case "table":
        case "index":
        case "from":
        case "where":
        case "and":
        case "or":
        case "not":
        case "is":
        case "null":
            return TokenType.KEYWORD;
        default:
            if (/^(-?[1-9]+\d*|0|[+-]0)$/.test(token)) {
                return TokenType.NUMBER;
            }
            if (token[0] === "\"") {
                return TokenType.STRING;
            }
            if (token in [">", "<", "=", "<>"]) {
                return TokenType.OPERATOR;
            }
            return TokenType.IDENT;
    }
}

function parseSelect(tokens: string[]): Select {

    // syntax for "select" :  
//    
//     <select-stmt> ::= select <identifiers> from <identifier> <select-restriction>
//                       | select * from <identifier> <select-restriction>
//    
//     <identifiers> ::= <identifier> 
//                     | <identifier> , <identifiers>
//    
//     <select-restriction> ::= where <expression> ;
//                            | ;
//     
//     <expression> ::= <and-expr> or <expression>
//                    | <and-expr>
//     
//     <and-expr> ::= <not-expr> and <and-expr>
//                  | <not-expr>
//    
//     <not-expr> ::= not <not-expr> 
//                  | <factor>
//    
//     <factor> ::= ( <expression> )
//                | <cmp-expr>
//    
//     <cmp-expr> ::= <value> == <value>
//                  | <value> <> <value>
//                  | <value> > <value>
//                  | <value> < <value>
//                  | <value> is null
//                  | <value> is not null
//    
//     <value> ::= <identifier>
//               | <string-literal>
//               | <int-literal>
//               | <bool-literal>
//               | <float-literal>

    // what we can confirmed is that the first one is select

    let position = 0;
    const max = tokens.length;

    function current(): string {
        if (position < max)
            return tokens[position];
        else
            return null;
    }

    function shift() {
        if (position < max) {
            const temp = tokens[position];
            position++;
            return temp;
        } else {
            return null;
        }
    }

    function match(str? : string): void {
        if (str) {
            if (current() === str) {
                position++;
            } else {
                throw `Parse Error : when parsing <select-expression>, expected token \"${str}\" , actual token \"${
                    current()}\"`;
            }
        } else {
            if (position < max) position++;
        }
    }

    function parseValue(): AST {
        switch (getTokenType(current())) {
            case TokenType.KEYWORD:
                throw "Parse Error : when parsing <value>, unexpected token type: keyword";
            case TokenType.NUMBER:
                return new Ast.NumLitAST(parseFloat(shift()));
            case TokenType.STRING:
                return new Ast.StrLitAST(shift());
            case TokenType.IDENT:
                return new Ast.IdAST(shift());
            case TokenType.OPERATOR:
                throw "Parse Error : when parsing <value>, unexpected token type: operator";
            default:
                throw "Parse Error : when parsing <value>, unexpected token type: unknown";
        }
    }

    function parseCmpExpr() : AST {
        const lhs = parseValue();
        let lookAhead = current();

        switch (getTokenType(lookAhead)) {
            case TokenType.KEYWORD:
                if (lookAhead !== "is") {
                    throw `Parse Error : when parsing <cmp-expr>, unexpected keyword ${lookAhead}`;
                }
                match("is");
                if (current() === "not") {
                    match();
                    match("null");
                    return new Ast.NotAST(new Ast.IsNullAST(parseValue()));
                }
                match("null");
                return new Ast.IsNullAST(parseValue());
            case TokenType.OPERATOR:
                match();
                lookAhead = current();
                let rhs = parseValue();
                switch (lookAhead) {
                    case "=": return new Ast.BinopAST(BINOP.EQ, lhs, rhs);
                    case "<>": return new Ast.BinopAST(BINOP.NE, lhs, rhs);
                    case ">": return new Ast.BinopAST(BINOP.LS, lhs, rhs);
                    case "<": return new Ast.BinopAST(BINOP.GT, lhs, rhs);
                    default:
                        throw "Parse Error : when parsing <cmp-expr>, unknown error";
                }
        default:
            throw "Parse Error : when parsing <value>, unexpected token type: unknown";
        }
    }

    function parseFactor(): AST {
        if (current() === "(") {
            match("(");
            const temp = parseCmpExpr();
            match(")");
            return temp;
        }
        return parseCmpExpr();
    }

    function parseNotExpr(): AST {
        if (current() === "not") {
            match();
            return new Ast.NotAST(parseNotExpr());
        }
        return parseFactor();
    }

    function parseAndExpr(): AST {
        let cur = parseNotExpr();
        while (current() === "and") {
            match();
            cur = new Ast.BinopAST(BINOP.AN, cur, parseNotExpr());
        }
        return cur;
    }

    function parseExpr() : AST  {
        let cur = parseAndExpr();
        while (current() === "or") {
            match();
            cur = new Ast.BinopAST(BINOP.OR, cur, parseAndExpr());
        }
        return cur;
    }

    function parseSelectRestriction(): AST {
        let temp: AST = null;
        if (current() === "where") {
            match(); // match "where"
            temp = parseExpr();
        }
        match(";");
        return temp;
    }

    function parseIdentifiers(): string[] {
        const res: string[] = [];
        if (getTokenType(current()) !== TokenType.IDENT) {
            throw `Parse Error : when parsing identifiers, expected identifier, got ${current()}`;
        }
        res.push(shift());
        while (current() === ",") {
            match(","); 
            if (getTokenType(current()) !== TokenType.IDENT) {
                throw `Parse Error : when parsing identifiers, expected identifier, got ${current()}`;
            }
            res.push(shift());
        }
        return res;
    }

    function parseSelectStmt(): Select {
        let names: string[] = [];
        let tableName: string;
        let restriction: AST;
        match("select");
        if (!(current() === "*")) {
            names = parseIdentifiers();
        } else {
            match("*");
        }
        match("from");
        tableName = shift();
        restriction = parseSelectRestriction();
        return new Select(names, tableName, restriction);
    }

    return parseSelectStmt();
}

function parseDelete(tokens: string[]): Delete {
    // TODO
    return new Delete(null, null);
}

function parseDropIndex(tokens: string[]): DropIndex {
    // TODO
    return new DropIndex(null, null);
}

function parseDropTable(tokens: string[]): DropTable {
    // TODO
    return new DropTable(null);
}

function parseCreateIndex(tokens: string[]): CreateIndex {
    // TODO
    return new CreateIndex(null, null, null);
}

function parseCreateTable(tokens: string[]): CreateTable {
    // TODO
    return new CreateTable(null, null, null, null);
}

function parseInsert(tokens: string[]): Insert {
    // TODO
    return new Insert(null, null);
}

export function parse(inst : string) : Instruction {
    let tokens = Tokenizer.tokenizer(inst);
    switch (tokens[0]) {
        case "select":
            return parseSelect(tokens);
        case "delete":
            return parseDelete(tokens);
        case "drop":
            if (tokens[1] === "index") {
                return parseDropIndex(tokens);
            } else if (tokens[1] === "table") {
                return parseDropTable(tokens);
            }
            throw `unrecognized token "${tokens[1]}" after drop keyword`;
        case "create":
            if (tokens[1] === "index") {
                return parseCreateIndex(tokens);
            } else if (tokens[1] === 'table') {
                return parseCreateTable(tokens);
            }
            throw `unrecognized token "${tokens[1]}" after create keyword`;
        case "insert":
            return parseInsert(tokens);
        default:
            throw `unrecognized syntax with leading "${tokens[0]}"`; 
    }
}