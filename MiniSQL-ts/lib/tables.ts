import {IType, parseType } from "./types";

export class TableMember {
    index: string;
    type: IType;
    unique: boolean;

    constructor(index: string, type: IType, unique: boolean) {
        this.index = index;
        this.type = type;
        this.unique = unique;
    }

    toString(): string {
        return JSON.stringify({index: this.index, type: this.type.toString(), unique:this.unique});
    }
}

export function parseTableMember(json: string): TableMember {
    const temp = JSON.parse(json);
    return new TableMember(temp.index, parseType(temp.type), temp.unique);
}

export class TableHeader {
    name: string;
    members: TableMember[];
    primary: string;

    constructor(name: string, members: TableMember[], primary: string) {
        this.name = name;
        this.members = members;
        this.primary = primary;
    }

    toString(): string {
        return JSON.stringify({name : this.name, members: this.members.map(x => x.toString()), primary: "primary"});
    }
}

export function parseTableHeader(header: string): TableHeader {
    const temp = JSON.parse(header);
    return new TableHeader(temp.name, temp.members.map(x => parseTableMember(x)), temp.primary);
}

//export class Record {
//    table: TableHeader;
//    value: ValueType[];
//
//    constructor(table: TableHeader, value: Ast.ValueType[]) {
//        this.table = table;
//        this.value = value;
//    }
//}

export class Table {
    header: TableHeader;
//    records: Record[];
    indices: Index[];

    constructor(header: TableHeader, indices : Index[]) {
        this.header = header;
//        this.records = [];
        this.indices = indices;
    }

    tableMetaData(): string {
        return JSON.stringify({ header: this.header.toString(), indices: this.indices.map(x => x.toString()) });
    }
}

export function parseTable(temp: any): Table {
    return new Table(parseTableHeader(temp.header), temp.indices.map(x => parseIndex(x)));
}

export class Index {
    name: string;
    index: string;
    constructor(name: string, index: string) {
        this.name = name;
        this.index = index;
    }
    toString() {
        return JSON.stringify({ name: this.name, index: this.index });
    }
}

export function parseIndex(index: string): Index {
    const temp = JSON.parse(index);
    return new Index(temp.name, temp.index);
}

