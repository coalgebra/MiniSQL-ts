"use strict";
//import {*} from "readline";
//import {} from "@types/readline-sync"
Object.defineProperty(exports, "__esModule", { value: true });
var readline = require("readline");
var Tokenizer = require("./lib/tokenizer");
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.on("line", function (code) {
    console.log(Tokenizer.tokenizer(code));
});
//console.log('Hello world');
//# sourceMappingURL=app.js.map