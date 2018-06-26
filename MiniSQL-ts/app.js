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
//console.log(tokenize("select fucker,pussy from bitch where age=24 and name<>\"wtf\";"));
//console.log(parse("select fucker,pussy from bitch where son is null and age=24 and name<>\"wtf\";"));
//console.log(parse("create table fucker (a int, b char(20),  c float,  d int, primary key (b));"));
//console.log(parse("create index shit on fucker(a);"));
//console.log(tokenize("insert into fucker values (1, \"123\", 1.1, 2);"));
//console.log(parse("insert into fucker values (1, \"123\", 1.1, 2);"));
//console.log(parse("drop table fucker;"));
class Controller {
    constructor() {
        this.catalog = new catalog_1.Catalog();
        this.counter = 0;
    }
    deal(inst) {
        if (!inst)
            return "illegal statement";
        let t = process.hrtime();
        try {
            let res = this.catalog.deal(inst, console);
            this.counter++;
            if (this.counter >= 10 && inst.itype !== instruction_1.InstType.EXECUTE_FILE) {
                this.counter = 0;
                this.catalog.writeTableFile();
            }
            let t2 = process.hrtime();
            let time = (t2[0] - t[0]) + (t2[1] - t[1]) / 1e9;
            return `${res} in ${time} seconds`;
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