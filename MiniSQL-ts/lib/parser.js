"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var instruction = require("./instruction");
var Tokenizer = require("./tokenizer");
var Select = instruction.Select;
var Delete = instruction.Delete;
var DropIndex = instruction.DropIndex;
var DropTable = instruction.DropTable;
var CreateIndex = instruction.CreateIndex;
var CreateTable = instruction.CreateTable;
var Insert = instruction.Insert;
var Ast = require("./ast");
var BINOP = Ast.BINOP;
var Types = require("./types");
var IntType = Types.IntType;
var FloatType = Types.FloatType;
var CharsType = Types.CharsType;
var TableMember = instruction.TableMember;
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
            if (parseFloat(token)) {
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
    var position = 0;
    var max = tokens.length;
    function current() {
        if (position < max)
            return tokens[position];
        else
            return null;
    }
    function shift() {
        if (position < max) {
            var temp = tokens[position];
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
                throw "Parse Error : when parsing <restriction>, expected token \"" + str + "\" , actual token \"" + current() + "\"";
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
    function parseCmpExpr() {
        var lhs = parseValue();
        var lookAhead = current();
        switch (getTokenType(lookAhead)) {
            case TokenType.KEYWORD:
                if (lookAhead !== "is") {
                    throw "Parse Error : when parsing <cmp-expr>, unexpected keyword " + lookAhead;
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
                lookAhead = shift();
                var rhs = parseValue();
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
    function parseFactor() {
        if (current() === "(") {
            match("(");
            var temp = parseCmpExpr();
            match(")");
            return temp;
        }
        return parseCmpExpr();
    }
    function parseNotExpr() {
        if (current() === "not") {
            match();
            return new Ast.NotAST(parseNotExpr());
        }
        return parseFactor();
    }
    function parseAndExpr() {
        var cur = parseNotExpr();
        while (current() === "and") {
            match();
            cur = new Ast.BinopAST(BINOP.AN, cur, parseNotExpr());
        }
        return cur;
    }
    function parseExpr() {
        var cur = parseAndExpr();
        while (current() === "or") {
            match();
            cur = new Ast.BinopAST(BINOP.OR, cur, parseAndExpr());
        }
        return cur;
    }
    function parseRestric() {
        var temp = null;
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
    var position = 0;
    var max = tokens.length;
    function current() {
        if (position < max)
            return tokens[position];
        else
            return null;
    }
    function shift() {
        if (position < max) {
            var temp = tokens[position];
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
                throw "Parse Error : when parsing <select>, expected token \"" + str + "\" , actual token \"" + current() + "\"";
            }
        }
        else {
            if (position < max)
                position++;
        }
    }
    function parseIdentifiers() {
        var res = [];
        if (getTokenType(current()) !== TokenType.IDENT) {
            throw "Parse Error : when parsing <identifiers>, expected identifier, got " + current();
        }
        res.push(shift());
        while (current() === ",") {
            match(",");
            if (getTokenType(current()) !== TokenType.IDENT) {
                throw "Parse Error : when parsing <identifiers>, expected identifier, got " + current();
            }
            res.push(shift());
        }
        return res;
    }
    function parseSelectStmt() {
        var names = [];
        match("select");
        if (!(current() === "*")) {
            names = parseIdentifiers();
        }
        else {
            match("*");
        }
        match("from");
        var tableName = shift();
        var restriction = parseRestriction(tokens.slice(position, max));
        return new Select(names, tableName, restriction);
    }
    return parseSelectStmt();
}
function parseDelete(tokens) {
    //    delete is almost the same with Select
    //    
    //    <delete> ::= delete [*] from <identifier> <restriction> ;
    var position = 0;
    var max = tokens.length;
    function current() {
        if (position < max)
            return tokens[position];
        else
            return null;
    }
    function shift() {
        if (position < max) {
            var temp = tokens[position];
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
                throw "Parse Error : when parsing <delete>, expected token \"" + str + "\" , actual token \"" + current() + "\"";
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
        var tableName = shift();
        var restriction = parseRestriction(tokens.slice(position, max));
        return new Delete(tableName, restriction);
    }
    return parseDeleteStmt();
}
function parseDropIndex(tokens) {
    //     syntax for drop index :
    //    
    //     <drop-index> ::= drop index <identifier> on <identifier>
    var position = 0;
    var max = tokens.length;
    function current() {
        if (position < max)
            return tokens[position];
        else
            return null;
    }
    function shift() {
        if (position < max) {
            var temp = tokens[position];
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
                throw "Parse Error : when parsing <drop-index>, expected token \"" + str + "\" , actual token \"" + current() + "\"";
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
            throw "Parse Error : when parsing <drop-index>, unexpected token " + current();
        }
        var indexName = shift();
        match("on");
        if (getTokenType(current()) !== TokenType.IDENT) {
            throw "Parse Error : when parsing <drop-index>, unexpected token " + current();
        }
        var tableName = shift();
        match(";");
        return new DropIndex(tableName, indexName);
    }
    return parseDropIndexStmt();
}
function parseDropTable(tokens) {
    //     syntax for drop table :
    //    
    //     <drop-index> ::= drop table <identifier> ;
    var position = 0;
    var max = tokens.length;
    function current() {
        if (position < max)
            return tokens[position];
        else
            return null;
    }
    function shift() {
        if (position < max) {
            var temp = tokens[position];
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
                throw "Parse Error : when parsing <drop-table>, expected token \"" + str + "\" , actual token \"" + current() + "\"";
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
            throw "Parse Error : when parsing <drop-table>, unexpected token " + current();
        }
        var tableName = shift();
        match(";");
        return new DropTable(tableName);
    }
    return parseDropTableStmt();
}
function parseCreateIndex(tokens) {
    //     syntax for drop index :
    //    
    //     <drop-index> ::= drop index <identifier> on <identifier>
    var position = 0;
    var max = tokens.length;
    function current() {
        if (position < max)
            return tokens[position];
        else
            return null;
    }
    function shift() {
        if (position < max) {
            var temp = tokens[position];
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
                throw "Parse Error : when parsing <create-index>, expected token \"" + str + "\" , actual token \"" + current() + "\"";
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
            throw "Parse Error : when parsing <create-index>, unexpected token " + current();
        }
        var indexName = shift();
        match("on");
        if (getTokenType(current()) !== TokenType.IDENT) {
            throw "Parse Error : when parsing <create-index>, unexpected token " + current();
        }
        var tableName = shift();
        match("(");
        var elementName = shift();
        match(")");
        match(";");
        return new CreateIndex(tableName, indexName, elementName);
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
    var position = 0;
    var max = tokens.length;
    function current() {
        if (position < max)
            return tokens[position];
        else
            return null;
    }
    function shift() {
        if (position < max) {
            var temp = tokens[position];
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
                throw "Parse Error : when parsing <create-table>, expected token \"" + str + "\" , actual token \"" + current() + "\"";
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
                return new IntType();
            case "float":
                match();
                return new FloatType();
            case "char":
                match();
                match("(");
                if (!parseInt(current())) {
                    throw "Parse Error : when parsing <char-type> in <create-table>, unexpected token : " + current();
                }
                var temp = parseInt(shift());
                match(")");
                return new CharsType(temp);
            default:
                throw "Parse Error : when parsing <type> in <create-table>, unexpected token : " + current();
        }
    }
    function parseMemberDefs() {
        var memberDefs = [];
        var name = shift();
        var type = parseType();
        var unique = false;
        if (current() === "unique") {
            match();
            unique = true;
        }
        memberDefs.push(new TableMember(name, type, unique));
        ;
        while (current() === ",") {
            match();
            if (current() === "primary")
                break;
            var name1 = shift();
            var type1 = parseType();
            var unique1 = false;
            if (current() === "unique") {
                match();
                unique1 = true;
            }
            memberDefs.push(new TableMember(name1, type1, unique1));
        }
        return memberDefs;
    }
    function parsePrimSpecific() {
        if (current() === "primary") {
            match();
            match("key");
            match("(");
            if (getTokenType(current()) === TokenType.IDENT) {
                var temp = shift();
                match(")");
                return temp;
            }
            throw "Parse Error : when parsing <prim-specific>, unexpected token " + current();
        }
        return null;
    }
    function parseCreateTableStmt() {
        match("create");
        match("table");
        if (getTokenType(current()) !== TokenType.IDENT) {
            throw "Parse Error : when parsing <create-table>, unexpected token " + current();
        }
        var tableName = shift();
        match("(");
        var memberDef = parseMemberDefs();
        var prim = parsePrimSpecific();
        match(")");
        match(";");
        return new CreateTable(tableName, memberDef, prim);
    }
    return parseCreateTableStmt();
}
function parseInsert(tokens) {
    // syntax for insert :
    // <insert> ::= insert into <identifier> values ( <values> ) ;
    // <values> ::= <value> , <values>
    //            | <value>
    // <value>  ::= <integer> | <float> | <string> | 
    var position = 0;
    var max = tokens.length;
    function current() {
        if (position < max)
            return tokens[position];
        else
            return null;
    }
    function shift() {
        if (position < max) {
            var temp = tokens[position];
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
                throw "Parse Error : when parsing <insert>, expected token \"" + str + "\" , actual token \"" + current() + "\"";
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
        throw "Parse Error : when parsing <value> in <insert>, unexpected token" + current();
    }
    function parseValues() {
        var res = [];
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
            throw "Parse Error : when parsing <insert>, unexpected token " + current();
        }
        var tableName = shift();
        match("values");
        match("(");
        var values = parseValues();
        match(")");
        match(";");
        return new Insert(tableName, values);
    }
    return parseInsertStmt();
}
function parser(inst) {
    var tokens = Tokenizer.tokenizer(inst);
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
            throw "unrecognized token \"" + tokens[1] + "\" after drop keyword";
        case "create":
            if (tokens[1] === "index") {
                return parseCreateIndex(tokens);
            }
            else if (tokens[1] === 'table') {
                return parseCreateTable(tokens);
            }
            throw "unrecognized token \"" + tokens[1] + "\" after create keyword";
        case "insert":
            return parseInsert(tokens);
        default:
            throw "unrecognized syntax with leading \"" + tokens[0] + "\"";
    }
}
function parse(code) {
    try {
        var res = parser(code);
        return res;
    }
    catch (e) {
        console.error(e);
        return null;
    }
}
exports.parse = parse;
//# sourceMappingURL=parser.js.map