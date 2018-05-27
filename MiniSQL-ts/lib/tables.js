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
//export class Record {
//    table: TableHeader;
//    value: ValueType[];
//
//    constructor(table: TableHeader, value: Ast.ValueType[]) {
//        this.table = table;
//        this.value = value;
//    }
//}
class Table {
    constructor(header, indices) {
        this.header = header;
        //        this.records = [];
        this.indices = indices;
    }
    tableMetaData() {
        return JSON.stringify({ header: this.header.toString(), indices: this.indices.map(x => x.toString()) });
    }
}
exports.Table = Table;
function parseTable(temp) {
    return new Table(parseTableHeader(temp.header), temp.indices.map(x => parseIndex(x)));
}
exports.parseTable = parseTable;
class Index {
    constructor(name, index) {
        this.name = name;
        this.index = index;
    }
    toString() {
        return JSON.stringify({ name: this.name, index: this.index });
    }
}
exports.Index = Index;
function parseIndex(index) {
    const temp = JSON.parse(index);
    return new Index(temp.name, temp.index);
}
exports.parseIndex = parseIndex;
//# sourceMappingURL=tables.js.map