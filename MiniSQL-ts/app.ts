import * as readline from "readline";
import * as Tokenizer from "./lib/tokenizer";
import * as Parser from "./lib/parser";
import parse = Parser.parse;
import {Catalog} from "./lib/catalog";
import { Instruction, InstType } from "./lib/instruction";

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
    catalog: Catalog;
    counter: number;
    constructor() {
        this.catalog = new Catalog();
        this.counter = 0;
    }
    deal(inst: Instruction): string {
        if (!inst) return "illegal statement";
        let t = process.hrtime();
        try {
            let res = this.catalog.deal(inst, console);
            this.counter++;
            if (this.counter >= 10 && inst.itype !== InstType.EXECUTE_FILE) {
                this.counter = 0;
                this.catalog.writeTableFile();
            }
            let t2 = process.hrtime();
            let time = (t2[0] - t[0]) + (t2[1] - t[1]) / 1e9;
            return `${res} in ${time} seconds`;
        } catch (xxx) {
            return xxx;
        }
    }
}

const cat = new Controller();

rl.on("line",
    (code: string) => {
        console.log(cat.deal(parse(code)));
    });


//console.log('Hello world');
