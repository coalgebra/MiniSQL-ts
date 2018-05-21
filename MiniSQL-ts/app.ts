//import {*} from "readline";
//import {} from "@types/readline-sync"

import readline = require("readline");
import Tokenizer = require("./lib/tokenizer");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on("line",
    (code: string) => {
        console.log(Tokenizer.tokenizer(code));
    });



//console.log('Hello world');
