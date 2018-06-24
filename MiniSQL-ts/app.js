"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const readline = require("readline");
const Parser = require("./lib/parser");
var parse = Parser.parse;
const catalog_1 = require("./lib/catalog");
const instruction_1 = require("./lib/instruction");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
//console.log(Parser.parse("create index fucker on bitch(shit);")); // test for create-index
//console.log(parse("drop index fuck on bitch;"));
////console.log(tokenize("select fucker,pussy from bitch where age=24 and name<>\"wtf\";"));
//console.log(parse("select fucker,pussy from bitch where son is null and age=24 and name<>\"wtf\";"));
//console.log(parse("create table fucker (a int, b char(20),  c float,  d int, primary key (b));"));
//console.log(parse("create index shit on fucker(a);"));
//console.log(tokenize("insert into fucker values (1, \"123\", 1.1, 2);"));
//console.log(parse("insert into fucker values (1, \"123\", 1.1, 2);"));
//console.log(parse("drop table fucker;"));
class Controller {
    constructor() {
        this.catalog = new catalog_1.Catalog();
    }
    deal(inst) {
        if (!inst)
            return "illegal statement";
        try {
            switch (inst.itype) {
                case instruction_1.InstType.CREATE_TABLE:
                    return this.catalog.createTable(inst);
                case instruction_1.InstType.CREATE_INDEX:
                    return this.catalog.createIndex(inst);
                case instruction_1.InstType.DROP_INDEX:
                    return this.catalog.dropIndex(inst);
                case instruction_1.InstType.DROP_TABLE:
                    return this.catalog.dropTable(inst);
                case instruction_1.InstType.SELECT:
                    return this.catalog.select(inst);
                case instruction_1.InstType.DELETE:
                    return this.catalog.delete(inst);
                case instruction_1.InstType.INSERT:
                    return this.catalog.insert(inst);
                case instruction_1.InstType.EXIT:
                    this.catalog.exit(inst);
                    console.log(`bye bye`);
                    process.exit(0);
                case instruction_1.InstType.SHOW:
                    return this.catalog.show(inst);
                case instruction_1.InstType.LOAD:
                    return this.catalog.load(inst);
                default:
                    return "what the fuck";
            }
        }
        catch (xxx) {
            return xxx;
        }
    }
}
const cat = new Controller();
rl.on("line", (code) => {
    //        console.log(Tokenizer.tokenizer(code));
    //        console.log(parse(code));
    console.log(cat.deal(parse(code)));
});
//console.log('Hello world');
//# sourceMappingURL=app.js.map