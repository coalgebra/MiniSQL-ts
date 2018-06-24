"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ast_1 = require("./ast");
const instruction_1 = require("./instruction");
const types_1 = require("./types");
const tables_1 = require("./tables");
const tokenizer_1 = require("./tokenizer");
var TokenType;
(function (TokenType) {
    TokenType[TokenType["KEYWORD"] = 0] = "KEYWORD";
    TokenType[TokenType["NUMBER"] = 1] = "NUMBER";
    TokenType[TokenType["STRING"] = 2] = "STRING";
    TokenType[TokenType["IDENT"] = 3] = "IDENT";
    TokenType[TokenType["OPERATOR"] = 4] = "OPERATOR";
})(TokenType || (TokenType = {}));
;
function getTokenType(token) {
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
        case "on":
            return TokenType.KEYWORD;
        default:
            if (parseFloat(token) || token === "0") {
                return TokenType.NUMBER;
            }
            if (token[0] === "\"") {
                return TokenType.STRING;
            }
            if (/^(=|>|<|<>)$/.test(token)) {
                return TokenType.OPERATOR;
            }
            return TokenType.IDENT;
    }
}
function parseRestriction(tokens) {
    //     syntax for restriction
    //     
    //     <restriction> ::= where <expression> ;
    //                     | ;
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
    let position = 0;
    const max = tokens.length;
    function current() {
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
        }
        else {
            return null;
        }
    }
    function match(str) {
        if (str) {
            if (current() === str) {
                position++;
            }
            else {
                throw `Parse Error : when parsing <restriction>, expected token \"${str}\" , actual token \"${current()}\"`;
            }
        }
        else {
            if (position < max)
                position++;
        }
    }
    function parseValue() {
        switch (getTokenType(current())) {
            case TokenType.KEYWORD:
                throw "Parse Error : when parsing <value>, unexpected token type: keyword";
            case TokenType.NUMBER:
                return new ast_1.NumLitAST(parseFloat(shift()));
            case TokenType.STRING:
                return new ast_1.StrLitAST(shift());
            case TokenType.IDENT:
                return new ast_1.IdAST(shift());
            case TokenType.OPERATOR:
                throw "Parse Error : when parsing <value>, unexpected token type: operator";
            default:
                throw "Parse Error : when parsing <value>, unexpected token type: unknown";
        }
    }
    function parseCmpExpr() {
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
                    return new ast_1.NotAST(new ast_1.IsNullAST(lhs));
                }
                match("null");
                return new ast_1.IsNullAST(lhs);
            case TokenType.OPERATOR:
                lookAhead = shift();
                const rhs = parseValue();
                switch (lookAhead) {
                    case "=": return new ast_1.BinopAST(ast_1.BINOP.EQ, lhs, rhs);
                    case "<>": return new ast_1.BinopAST(ast_1.BINOP.NE, lhs, rhs);
                    case ">": return new ast_1.BinopAST(ast_1.BINOP.LS, lhs, rhs);
                    case "<": return new ast_1.BinopAST(ast_1.BINOP.GT, lhs, rhs);
                    default:
                        throw "Parse Error : when parsing <cmp-expr>, unknown error";
                }
            default:
                throw "Parse Error : when parsing <value>, unexpected token type: unknown";
        }
    }
    function parseFactor() {
        if (current() === "(") {
            match("(");
            const temp = parseCmpExpr();
            match(")");
            return temp;
        }
        return parseCmpExpr();
    }
    function parseNotExpr() {
        if (current() === "not") {
            match();
            return new ast_1.NotAST(parseNotExpr());
        }
        return parseFactor();
    }
    function parseAndExpr() {
        let cur = parseNotExpr();
        while (current() === "and") {
            match();
            cur = new ast_1.BinopAST(ast_1.BINOP.AN, cur, parseNotExpr());
        }
        return cur;
    }
    function parseExpr() {
        let cur = parseAndExpr();
        while (current() === "or") {
            match();
            cur = new ast_1.BinopAST(ast_1.BINOP.OR, cur, parseAndExpr());
        }
        return cur;
    }
    function parseRestric() {
        let temp = null;
        if (current() === "where") {
            match(); // match "where"
            temp = parseExpr();
        }
        match(";");
        return temp;
    }
    return parseRestric();
}
function parseSelect(tokens) {
    //     syntax for "select" :  
    //    
    //     <select-stmt> ::= select <identifiers> from <identifier> <restriction>
    //                       | select * from <identifier> <restriction>
    //    
    //     <identifiers> ::= <identifier> 
    //                     | <identifier> , <identifiers>
    //    
    let position = 0;
    const max = tokens.length;
    function current() {
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
        }
        else {
            return null;
        }
    }
    function match(str) {
        if (str) {
            if (current() === str) {
                position++;
            }
            else {
                throw `Parse Error : when parsing <select>, expected token \"${str}\" , actual token \"${current()}\"`;
            }
        }
        else {
            if (position < max)
                position++;
        }
    }
    function parseIdentifiers() {
        const res = [];
        if (getTokenType(current()) !== TokenType.IDENT) {
            throw `Parse Error : when parsing <identifiers>, expected identifier, got ${current()}`;
        }
        res.push(shift());
        while (current() === ",") {
            match(",");
            if (getTokenType(current()) !== TokenType.IDENT) {
                throw `Parse Error : when parsing <identifiers>, expected identifier, got ${current()}`;
            }
            res.push(shift());
        }
        return res;
    }
    function parseSelectStmt() {
        let names = [];
        match("select");
        if (!(current() === "*")) {
            names = parseIdentifiers();
        }
        else {
            match("*");
        }
        match("from");
        const tableName = shift();
        const restriction = parseRestriction(tokens.slice(position, max));
        return new instruction_1.Select(names, tableName, restriction);
    }
    return parseSelectStmt();
}
function parseDelete(tokens) {
    //    delete is almost the same with Select
    //    
    //    <delete> ::= delete [*] from <identifier> <restriction> ;
    let position = 0;
    const max = tokens.length;
    function current() {
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
        }
        else {
            return null;
        }
    }
    function match(str) {
        if (str) {
            if (current() === str) {
                position++;
            }
            else {
                throw `Parse Error : when parsing <delete>, expected token \"${str}\" , actual token \"${current()}\"`;
            }
        }
        else {
            if (position < max)
                position++;
        }
    }
    function parseDeleteStmt() {
        match("delete");
        if (current() === "*")
            match();
        match("from");
        const tableName = shift();
        const restriction = parseRestriction(tokens.slice(position, max));
        return new instruction_1.Delete(tableName, restriction);
    }
    return parseDeleteStmt();
}
function parseDropIndex(tokens) {
    //     syntax for drop index :
    //    
    //     <drop-index> ::= drop index <identifier> on <identifier>
    let position = 0;
    const max = tokens.length;
    function current() {
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
        }
        else {
            return null;
        }
    }
    function match(str) {
        if (str) {
            if (current() === str) {
                position++;
            }
            else {
                throw `Parse Error : when parsing <drop-index>, expected token \"${str}\" , actual token \"${current()}\"`;
            }
        }
        else {
            if (position < max)
                position++;
        }
    }
    function parseDropIndexStmt() {
        match("drop");
        match("index");
        if (getTokenType(current()) !== TokenType.IDENT) {
            throw `Parse Error : when parsing <drop-index>, unexpected token ${current()}`;
        }
        const indexName = shift();
        match("on");
        if (getTokenType(current()) !== TokenType.IDENT) {
            throw `Parse Error : when parsing <drop-index>, unexpected token ${current()}`;
        }
        const tableName = shift();
        match(";");
        return new instruction_1.DropIndex(tableName, indexName);
    }
    return parseDropIndexStmt();
}
function parseDropTable(tokens) {
    //     syntax for drop table :
    //    
    //     <drop-index> ::= drop table <identifier> ;
    let position = 0;
    const max = tokens.length;
    function current() {
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
        }
        else {
            return null;
        }
    }
    function match(str) {
        if (str) {
            if (current() === str) {
                position++;
            }
            else {
                throw `Parse Error : when parsing <drop-table>, expected token \"${str}\" , actual token \"${current()}\"`;
            }
        }
        else {
            if (position < max)
                position++;
        }
    }
    function parseDropTableStmt() {
        match("drop");
        match("table");
        if (getTokenType(current()) !== TokenType.IDENT) {
            throw `Parse Error : when parsing <drop-table>, unexpected token ${current()}`;
        }
        const tableName = shift();
        match(";");
        return new instruction_1.DropTable(tableName);
    }
    return parseDropTableStmt();
}
function parseCreateIndex(tokens) {
    //     syntax for drop index :
    //    
    //     <drop-index> ::= drop index <identifier> on <identifier>
    let position = 0;
    const max = tokens.length;
    function current() {
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
        }
        else {
            return null;
        }
    }
    function match(str) {
        if (str) {
            if (current() === str) {
                position++;
            }
            else {
                throw `Parse Error : when parsing <create-index>, expected token \"${str}\" , actual token \"${current()}\"`;
            }
        }
        else {
            if (position < max)
                position++;
        }
    }
    function parseCreateIndexStmt() {
        match("create");
        match("index");
        if (getTokenType(current()) !== TokenType.IDENT) {
            throw `Parse Error : when parsing <create-index>, unexpected token ${current()}`;
        }
        const indexName = shift();
        match("on");
        if (getTokenType(current()) !== TokenType.IDENT) {
            throw `Parse Error : when parsing <create-index>, unexpected token ${current()}`;
        }
        const tableName = shift();
        match("(");
        const elementName = shift();
        match(")");
        match(";");
        return new instruction_1.CreateIndex(indexName, tableName, elementName);
    }
    return parseCreateIndexStmt();
}
function parseCreateTable(tokens) {
    // syntax for create table
    // 
    // <create-table> ::= create table <identifier> ( <member-definitions> <prim-specific> ) ; 
    // 
    // <member-definitions> ::= <member-definition> , <member-definitions>
    //                         | <member-definition> ,
    // 
    // <member-definition> ::= <identifier> <type> 
    //                        | <identifier> <type> <unique-annotation>
    //
    // <unique-annotation> ::= unique
    //
    // <type> ::= int
    //          | float
    //          | char ( <number> )
    //
    // <prim-specific> ::= primary key ( <identifier> ) 
    //                   | 
    let position = 0;
    const max = tokens.length;
    function current() {
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
        }
        else {
            return null;
        }
    }
    function match(str) {
        if (str) {
            if (current() === str) {
                position++;
            }
            else {
                throw `Parse Error : when parsing <create-table>, expected token \"${str}\" , actual token \"${current()}\"`;
            }
        }
        else {
            if (position < max)
                position++;
        }
    }
    function parseType() {
        switch (current()) {
            case "int":
                match();
                return new types_1.IntType();
            case "float":
                match();
                return new types_1.FloatType();
            case "char":
                match();
                match("(");
                if (!parseInt(current())) {
                    throw `Parse Error : when parsing <char-type> in <create-table>, unexpected token : ${current()}`;
                }
                const temp = parseInt(shift());
                match(")");
                return new types_1.CharsType(temp);
            default:
                throw `Parse Error : when parsing <type> in <create-table>, unexpected token : ${current()}`;
        }
    }
    function parseMemberDefs() {
        const memberDefs = [];
        const name = shift();
        const type = parseType();
        let unique = false;
        if (current() === "unique") {
            match();
            unique = true;
        }
        memberDefs.push(new tables_1.TableMember(name, type, unique));
        ;
        while (current() === ",") {
            match();
            if (current() === "primary")
                break;
            const name1 = shift();
            const type1 = parseType();
            let unique1 = false;
            if (current() === "unique") {
                match();
                unique1 = true;
            }
            memberDefs.push(new tables_1.TableMember(name1, type1, unique1));
        }
        return memberDefs;
    }
    function parsePrimSpecific() {
        if (current() === "primary") {
            match();
            match("key");
            match("(");
            if (getTokenType(current()) === TokenType.IDENT) {
                let temp = shift();
                match(")");
                return temp;
            }
            throw `Parse Error : when parsing <prim-specific>, unexpected token ${current()}`;
        }
        return null;
    }
    function parseCreateTableStmt() {
        match("create");
        match("table");
        if (getTokenType(current()) !== TokenType.IDENT) {
            throw `Parse Error : when parsing <create-table>, unexpected token ${current()}`;
        }
        const tableName = shift();
        match("(");
        const memberDef = parseMemberDefs();
        const prim = parsePrimSpecific();
        match(")");
        match(";");
        return new instruction_1.CreateTable(tableName, memberDef, prim);
    }
    return parseCreateTableStmt();
}
function parseInsert(tokens) {
    // syntax for insert :
    // <insert> ::= insert into <identifier> values ( <values> ) ;
    // <values> ::= <value> , <values>
    //            | <value>
    // <value>  ::= <integer> | <float> | <string> | 
    let position = 0;
    const max = tokens.length;
    function current() {
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
        }
        else {
            return null;
        }
    }
    function match(str) {
        if (str) {
            if (current() === str) {
                position++;
            }
            else {
                throw `Parse Error : when parsing <insert>, expected token \"${str}\" , actual token \"${current()}\"`;
            }
        }
        else {
            if (position < max)
                position++;
        }
    }
    function parseValue() {
        if (current() === "," || current() === ")")
            return null;
        if (getTokenType(current()) === TokenType.STRING)
            return shift();
        if (getTokenType(current()) === TokenType.NUMBER)
            return parseFloat(shift());
        throw `Parse Error : when parsing <value> in <insert>, unexpected token${current()}`;
    }
    function parseValues() {
        const res = [];
        res.push(parseValue());
        while (current() === ",") {
            match();
            res.push(parseValue());
        }
        return res;
    }
    function parseInsertStmt() {
        match("insert");
        match("into");
        if (getTokenType(current()) !== TokenType.IDENT) {
            throw `Parse Error : when parsing <insert>, unexpected token ${current()}`;
        }
        const tableName = shift();
        match("values");
        match("(");
        const values = parseValues();
        match(")");
        match(";");
        return new instruction_1.Insert(tableName, values);
    }
    return parseInsertStmt();
}
function parseLoad(tokens) {
    if (tokens[2] !== ";")
        throw `parse error : when parsing <load>, cannot find ';'`;
    return new instruction_1.Load(tokens[1]);
}
function parseShow(tokens) {
    switch (tokens[1]) {
        case "tables":
            return new instruction_1.Show("tables");
        case "index":
            return new instruction_1.Show(tokens[1]);
        default:
            throw `unexpected token ${tokens[1]} when parsing <show> instruction`;
    }
}
function parser(inst) {
    const tokens = tokenizer_1.tokenizer(inst);
    switch (tokens[0]) {
        case "select":
            return parseSelect(tokens);
        case "delete":
            return parseDelete(tokens);
        case "drop":
            if (tokens[1] === "index") {
                return parseDropIndex(tokens);
            }
            else if (tokens[1] === "table") {
                return parseDropTable(tokens);
            }
            throw `unrecognized token "${tokens[1]}" after drop keyword`;
        case "create":
            if (tokens[1] === "index") {
                return parseCreateIndex(tokens);
            }
            else if (tokens[1] === 'table') {
                return parseCreateTable(tokens);
            }
            throw `unrecognized token "${tokens[1]}" after create keyword`;
        case "insert":
            return parseInsert(tokens);
        case "exit":
            if (tokens.length > 2) {
                throw `parse error : when parsing <exit>, more tokens than expected`;
            }
            return new instruction_1.Exit();
        case "load":
            return parseLoad(tokens);
        case "show":
            return parseShow(tokens);
        default:
            throw `unrecognized syntax with leading "${tokens[0]}"`;
    }
}
exports.parser = parser;
function parse(code) {
    try {
        let res = parser(code);
        return res;
    }
    catch (e) {
        console.error(e);
        return null;
    }
}
exports.parse = parse;
//# sourceMappingURL=parser.js.map