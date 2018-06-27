"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const readline = require("readline");
const Parser = require("./lib/parser");
var parse = Parser.parse;
const CatalogManager_1 = require("./lib/CatalogManager");
const instruction_1 = require("./lib/instruction");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
class Controller {
    constructor() {
        this.catalog = new CatalogManager_1.CatalogManager();
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
                this.catalog.writeFile();
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
    console.log(cat.deal(parse(code)));
});
//console.log('Hello world');
//# sourceMappingURL=app.js.map