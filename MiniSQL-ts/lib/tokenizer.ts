﻿export function tokenizer(code: string): string[] {
    return code.match(/[_a-zA-Z][_a-zA-Z0-9]*|[*=;]|(<>)|[<]|[>]|"([^"]*(\\["])*)*"|(-?[1-9]+\d*|0|[+-]0)/g).map(x => x.toLowerCase());
}
