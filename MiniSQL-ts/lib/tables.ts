import Types = require("./types");
import IType = Types.IType;
import Ast = require("./ast");
import ValueType = Ast.ValueType;
import Instruction = require("./instruction");
import CreateTable = Instruction.CreateTable;
import CreateIndex = Instruction.CreateIndex;
import Insert = Instruction.Insert;
import Delete = Instruction.Delete;
import DropIndex = Instruction.DropIndex;
import DropTable = Instruction.DropTable;

export class TableMember {
    index: string;
    type: IType;
    unique: boolean;

    constructor(index: string, type: Types.IType, unique: boolean) {
        this.index = index;
        this.type = type;
        this.unique = unique;
    }
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
}

export class Record {
    table: TableHeader;
    value: ValueType[];

    constructor(table: TableHeader, value: Ast.ValueType[]) {
        this.table = table;
        this.value = value;
    }
}

export class Table {
    header: TableHeader;
    records: Record[];
    indices: Index[];

    constructor(header: TableHeader) {
        this.header = header;
        this.records = [];
        this.indices = [];
    }
}

export class Index {
    name: string;
    index: string;
    constructor(name: string, index: string) {
        this.name = name;
        this.index = index;
    }
}

class Catalog {
    tables: Table[];

    constructor() {
        this.tables = [];
    }

    createTable(inst: CreateTable): string {

        // search table with same name : 
        for (let table of this.tables) {
            if (table.header.name === inst.tableName) {
                throw `Runtime Error : when creating table ${inst.tableName}, table with same name was created before`;
            }
        }

        // create the table:
        this.tables.push(new Table(inst.toTableHeader()));

        return `create table ${inst.tableName} success`;
    }

    createIndex(inst: CreateIndex): string {

        let target: Table = null;

        // search table
        for (let table of this.tables) {
            if (table.header.name === inst.tableName) {
                target = table;
                break;
            }
        }

        if (!target) {
            throw `Runtime Error : when creating index ${inst.indexName} on table ${inst.tableName}, cannot find such table`;
        }

        // check same index

        for (let x of target.indices) {
            if (x.index === inst.tableName) {
                throw `Runtime Error : when creating index ${inst.indexName} on table ${inst.tableName}, there already exists an index with the same name`;
            }
        }

        target.indices.push(new Index(inst.indexName, inst.elementName));

        return `create index ${inst.indexName} on table ${inst.tableName} success`;
    }

    insert(inst: Insert): string {
        // TODO
        return null;
    }

    delete(inst: Delete): string {
        // TODO
        return null;
    }

    dropIndex(inst: DropIndex): string {
        // TODO
        return null;
    }

    dropTable(inst: DropTable): string {
        // TODO
        return null;
    }

}