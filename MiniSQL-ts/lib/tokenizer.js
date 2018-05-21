"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function tokenizer(code) {
    return code.match(/[_a-zA-Z][_a-zA-Z0-9]*|[*=;]|(<>)|"([^"]*(\\["])*)*"/g).map(function (x) { return x; });
}
exports.tokenizer = tokenizer;
//# sourceMappingURL=tokenizer.js.map