import { IType, parseType } from "./types";
import { Record } from "./records"; 

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

export class Table {
    header: TableHeader;
    indices: Index[];
    freeHead: number;
    records: (Record | number)[];

    constructor(header: TableHeader, indices : Index[], freeHead : number) {
        this.header = header;
        this.indices = indices;
        this.freeHead = freeHead;
        this.records = [];
    }

    tableMetaData(): string {
        return JSON.stringify({ header: this.header.toString(), indices: this.indices.map(x => x.toString()) });
    }
}

export class Index {
    name: string;
    index: string;
    order: number[];
    constructor(name: string, index: string, order: number[]) {
        this.name = name;
        this.index = index;
        this.order = order;
    }
}

//export function parseIndex(index: string): Index {
//    const temp = JSON.parse(index);
//    return new Index(temp.name, temp.index);
//}

