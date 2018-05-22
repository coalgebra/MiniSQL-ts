"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function tokenizer(code) {
    return code.match(/[_a-zA-Z][_a-zA-Z0-9]*|[*=;]|(<>)|[<>(),]|"([^"]*(\\["'])*)*"|'([^"]*(\\["'])*)*'|((-?\d+)(\.\d+)?)/g).map(function (x) { return x.toLowerCase(); });
}
exports.tokenizer = tokenizer;
//# sourceMappingURL=tokenizer.js.map