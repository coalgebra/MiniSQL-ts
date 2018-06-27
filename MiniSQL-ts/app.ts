import * as readline from "readline";
import * as Tokenizer from "./lib/tokenizer";
import * as Parser from "./lib/parser";
import parse = Parser.parse;
import {CatalogManager as Catalog} from "./lib/CatalogManager";
import { Instruction, InstType } from "./lib/instruction";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

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
                this.catalog.writeFile();
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
