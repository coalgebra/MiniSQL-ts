//import {*} from "readline";
//import {} from "@types/readline-sync"

import readline = require("readline");
import Tokenizer = require("./lib/tokenizer");
import Parser = require("./lib/parser");
import parse = Parser.parse;
import tokenize = Tokenizer.tokenizer;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log(Parser.parse("create index fucker on bitch(shit);")); // test for create-index
console.log(parse("drop index fuck on bitch;"));
//console.log(tokenize("select fucker,pussy from bitch where age=24 and name<>\"wtf\";"));
console.log(parse("select fucker,pussy from bitch where age=24 and name<>\"wtf\";"));
console.log(parse("create table fucker (a int, b char(20),  c float,  d int, primary key (b));"));
console.log(parse("create index shit on fucker(a);"));
console.log(tokenize("insert into fucker values (1, \"123\", 1.1, 2);"));
console.log(parse("insert into fucker values (1, \"123\", 1.1, 2);"));
console.log(parse("drop table fucker;"));

rl.on("line",
    (code: string) => {
//        console.log(Tokenizer.tokenizer(code));
        console.log(parse(code));
    });


//console.log('Hello world');
