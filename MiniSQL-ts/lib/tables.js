"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
class TableMember {
    constructor(index, type, unique) {
        this.index = index;
        this.type = type;
        this.unique = unique;
    }
    toString() {
        return JSON.stringify({ index: this.index, type: this.type.toString(), unique: this.unique });
    }
}
exports.TableMember = TableMember;
function parseTableMember(json) {
    const temp = JSON.parse(json);
    return new TableMember(temp.index, types_1.parseType(temp.type), temp.unique);
}
exports.parseTableMember = parseTableMember;
class TableHeader {
    constructor(name, members, primary) {
        this.name = name;
        this.members = members;
        this.primary = primary;
    }
    toString() {
        return JSON.stringify({ name: this.name, members: this.members.map(x => x.toString()), primary: "primary" });
    }
}
exports.TableHeader = TableHeader;
function parseTableHeader(header) {
    const temp = JSON.parse(header);
    return new TableHeader(temp.name, temp.members.map(x => parseTableMember(x)), temp.primary);
}
exports.parseTableHeader = parseTableHeader;
class Table {
    constructor(header, indices, freeHead) {
        this.header = header;
        this.indices = indices;
        this.freeHead = freeHead;
        this.records = [];
    }
    tableMetaData() {
        return JSON.stringify({ header: this.header.toString(), indices: this.indices.map(x => x.toString()) });
    }
}
exports.Table = Table;
class Index {
    constructor(name, index, order) {
        this.name = name;
        this.index = index;
        this.order = order;
    }
}
exports.Index = Index;
//export function parseIndex(index: string): Index {
//    const temp = JSON.parse(index);
//    return new Index(temp.name, temp.index);
//}
//# sourceMappingURL=tables.js.map