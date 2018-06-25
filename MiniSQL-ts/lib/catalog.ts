import {Table, Index,  parseTableHeader, TableHeader } from "./tables";
import {CreateTable, CreateIndex, Insert, Delete, DropIndex, DropTable, Exit, Load, Select, Show, Execute, Instruction,
    InstType } from "./instruction";
import { writeFileSync, readFileSync, writeFile, readFile, access, accessSync} from "fs";
import { IType, BasicType } from "./types";
import { Record } from "./records";
import { ILogger, FakeConsole } from "./io";
import { parser } from "./parser";

const DATA_PATH = "data/";
const TABLE_METADATA_PATH = DATA_PATH + "table.json";
const RECORD_PATH = DATA_PATH + "records/";

export class Catalog {

    tables: Table[];

    constructor() {
        this.readTableFile();
    }

    writeTableFile() {
        writeFileSync(TABLE_METADATA_PATH, JSON.stringify({
            tables: this.tables.map(x => {
                return { header: x.header, indices: x.indices, freeHead: x.freeHead };
            })
        }, null, 2));

        this.tables.map(table => {
            writeFileSync(RECORD_PATH + table.header.name + "_records.json",
                JSON.stringify({ records: table.records }, null, 2));
        });
    }

    readTableFile() {
        this.tables = [];
        let te = this;
        access(TABLE_METADATA_PATH,
            (err) => {
                if (err) {
                    return;
                }
                const temp = readFileSync(TABLE_METADATA_PATH);
                const content = temp.toString();
                const temp2 = JSON.parse(content);
                for (let x of temp2.tables) {
                    te.tables.push(x as Table);
                }
                for (let x of te.tables) {
                    let cont = readFileSync(RECORD_PATH + x.header.name + "_records.json");
                    let content = cont.toString();
                    x.records = JSON.parse(content).records;
                }
            });

    }

    createTable(inst: CreateTable, console: ILogger): string {

        // search table with same name : 
        for (let table of this.tables) {
            if (table.header.name === inst.tableName) {
                throw `Runtime Error : when creating table ${inst.tableName}, table with same name was created before`;
            }
        }

        let flag = false;

        for (let i = 0; i < inst.members.length; i++) {
            for (let j = i + 1; j < inst.members.length; j++) {
                if (inst.members[i].index === inst.members[j].index) {
                    throw `Runtime Error : when creating table ${inst.tableName}, two indices with the same name ${inst.members[i].index} are found`;
                }
            }
            if (inst.primary && !flag) {
                if (inst.primary === inst.members[i].index) {
                    flag = true;
                    inst.members[i].unique = true;
                }
            }
        }

        if (inst.primary && !flag) {
            throw `Runtime Error : when creating table ${inst.tableName}, primary key ${inst.primary} is not found in the table`;
        }

        this.tables.push(new Table(inst.toTableHeader(), [], -1));

        this.tables[this.tables.length - 1].records = [];

        if (inst.primary)
            this.createIndex(new CreateIndex(inst.tableName + "_primary", inst.tableName, inst.primary), console);

        return `create table ${inst.tableName} success`;
    }

    createIndex(inst: CreateIndex, console: ILogger): string {

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
            if (x.name === inst.indexName) {
                throw `Runtime Error : when creating index ${inst.indexName} on table ${inst.tableName}, there already exists an index with the same name`;
            }
        }

        let fieldType: IType = null;
        let fieldIndex = -1;
        let counter = 0;

        for (let x of target.header.members) {
            if (inst.fieldName === x.index) {
                fieldType = x.type;
                fieldIndex = counter;
                if (!x.unique) {
                    throw `Runtime Error : when creating index ${inst.indexName} on table ${inst.tableName}, the field is not unique`;
                }
            }
            counter++;
        }

        if (!fieldType) {
            throw `Runtime Error : when creating index ${inst.indexName} on table ${inst.tableName}, the field ${inst.fieldName} was not found`;
        }


        let order = new Array<number>();
        for (let i = 0; i < target.records.length; i++) {
            let x = target.records[i];
            if (typeof x !== "number") {
                order.push(i);
            } 
        }

        let fun = null;

        switch (fieldType.btype) {
            case BasicType.INT:
            case BasicType.FLOAT:
                fun = (a: number, b: number) => {
                    return ((target.records[a] as Record).value[fieldIndex] as number) >
                        ((target.records[b] as Record).value[fieldIndex] as number);
                };
                break;
            case BasicType.CHARS:
                fun = (a: number, b: number) => {
                    return ((target.records[a] as Record).value[fieldIndex] as string) >
                        ((target.records[b] as Record).value[fieldIndex] as string);
                };
        }

        order.sort(fun);

        target.indices.push(new Index(inst.indexName, inst.fieldName, order));

        return `create index ${inst.indexName} on table ${inst.tableName} success`;
    }


    insert(inst: Insert, console: ILogger): string {

        let target: Table = null;

        for (let table of this.tables) {
            if (table.header.name === inst.tableName) {
                target = table;
                break;
            }
        }

        if (!target) {
            throw `Runtime Error : when inserting value into table ${inst.tableName}, cannot find such table`;
        }

        // type check
        for (let i = 0; i < target.header.members.length; i++) {
            let val = inst.values[i];
            switch (target.header.members[i].type.btype) {
                case BasicType.INT:
                    if (typeof val !== "number") {
                        throw `Insert Error : when inserting into ${inst.tableName}, type dismatch`;
                    } else {
                        if (Math.floor(val) !== inst.values[i]) {
                            throw `Insert Error : when inserting into ${inst.tableName}, type dismatch`;
                        }
                    }
                    break;
                case BasicType.FLOAT:
                    if (typeof val !== "number") {
                        throw `Insert Error : when inserting into ${inst.tableName}, type dismatch`;
                    }
                    break;
                case BasicType.CHARS:
                    if (typeof val !== "string") {
                        throw `Insert Error : when inserting into ${inst.tableName}, type dismatch`;
                    }
            }
        }

        let pos: number;

        // insert record into records
        if (target.freeHead !== -1) {
            let cur = target.freeHead;
            pos = cur;
        } else {
            pos = target.records.length;
        }

        let posS: number[] = [];
        // insert records into indices
        for (let index of target.indices) {
            let size = index.order.length;
            let field: number = -1;
            for (let i = 0; i < target.header.members.length; i++) {
                if (index.index === target.header.members[i].index) {
                    field = i;
                    break;
                }
            }
            if (!size) {
                posS.push(size);
                continue;
            }
            if (inst.values[field] < (target.records[index.order[0]] as Record).value[field]) {
                posS.push(0);
                continue;
            }
            if (inst.values[field] > (target.records[index.order[size - 1]] as Record).value[field]) {
                posS.push(size);
                continue;
            }
            let l = 0, r = index.order.length - 1;
            let cmp = (l, val: number | string) => {
                return (target.records[index.order[l]] as Record).value[field] < val;
            }
            while (l < r - 1) {
                let mid = (l + r) >> 1;
                if (cmp(mid, inst.values[field])) { // inst.values > mid
                    l = mid;
                } else {
                    r = mid;
                }
            }
            if ((target.records[index.order[l]] as Record).value[field] === inst.values[field]) {
                throw `not unique value on property ${index.index}`;
            }
            posS.push(l);
//            index.order.splice(l, 0, pos);
        }

        if (target.freeHead !== -1) {
            let cur = target.freeHead;
            target.freeHead = target.records[cur] as number;
            target.records[cur] = new Record(inst.values);
        } else {
            target.records.push(new Record(inst.values));
        }

        let i = 0;
        for (let index of target.indices) {
            index.order.splice(posS[i], 0, pos);
            i++;
        }
        return `insert value success`;
    }

    delete(inst: Delete, console: ILogger): string {
        let table: Table = null;
        let records: Record[] = [];
        for (let tab of this.tables) {
            if (tab.header.name === inst.tableName) {
                table = tab;
                break;
            }
        }
        if (!table) {
            throw `Runtime Error : when deleting on ${inst.tableName}, cannot find such table`;
        }

        if (table.indices.length) { // there exists at least one index
            let order = table.indices[0].order.slice(0);
            for (let i of order) {
                if (!inst.restriction || inst.restriction.evaluate([table.header, table.records[i] as Record])) {
                    records.push(table.records[i] as Record);
                    let res = table.freeHead;
                    table.freeHead = i;
                    table.records[i] = res;
                    for (let index of table.indices) {
                        let pos = -1;
                        for (let j = 0; j < index.order.length; j++) {
                            if (index.order[j] === i) {
                                pos = j;
                                break;
                            }
                        }
                        index.order.splice(pos, 1);
                    }
                }
            }
        } else { // no index
            for (let i = 0; i < table.records.length; i++) {
                if (typeof table.records[i] === "number") {
                    continue;
                } else {
                    if (!inst.restriction || inst.restriction.evaluate([table.header, table.records[i] as Record])) {
                        records.push(table.records[i] as Record);
                        let res = table.freeHead;
                        table.freeHead = i;
                        table.records[i] = res;
                        for (let index of table.indices) {
                            let pos = -1;
                            for (let j = 0; j < index.order.length; j++) {
                                if (index.order[j] === i) {
                                    pos = j;
                                    break;
                                }
                            }
                            index.order.splice(pos, 1);
                        }
                    }
                }
            }
        }

        console.log(`Found ${records.length} result${records.length ? "s" : ""} : `);
        console.log("");
        let header: string = "";
        for (let i = 0; i < table.header.members.length; i++) {
            header += table.header.members[i].index;
            if (i !== table.header.members.length - 1) header += ", ";
        }
        console.log(`-------------------------------------------`);
        console.log(header);
        console.log(`-------------------------------------------`);
        for (let rec of records) {
            let res: string = "";
            for (let i = 0; i < rec.value.length; i++) {
                res += rec.value[i].toString();
                if (i !== rec.value.length - 1) res += ", ";
            }
            console.log(res);
        }
        console.log(`-------------------------------------------`);
        console.log("");

        return `delete value success`;
    }

    select(inst: Select, console: ILogger): string {
        let records: Record[] = [];
        let table: Table = null;
        for (let tab of this.tables) {
            if (tab.header.name === inst.tableName) {
                table = tab;
                break;
            }
        }
        if (!table) {
            throw `Runtime Error : when selecting on ${inst.tableName}, cannot find such table`;
        }
        let poss: number[] = [];
        if (inst.names.length) {
            for (let name of inst.names) {
                let pos = -1;
                for (let i = 0; i < table.header.members.length; i++) {
                    if (name === table.header.members[i].index) {
                        pos = i;
                        break;
                    }
                }
                if (pos === -1) {
                    throw `Runtime Error : when selecting on ${inst.tableName}, cannot find such field ${name}`;
                }
                poss.push(pos);
            }
        }
        if (table.indices.length) { // there exists at least one index
            let order = table.indices[0].order;
            for (let i of order) {
                if (!inst.restriction || inst.restriction.evaluate([table.header, table.records[i] as Record])) {
                    records.push(table.records[i] as Record);
                }
            }
        } else { // no index
            for (let i = 0; i < table.records.length; i++) {
                if (typeof table.records[i] === "number") {
                    continue;
                } else {
                    if (!inst.restriction || inst.restriction.evaluate([table.header, table.records[i] as Record])) {
                        records.push(table.records[i] as Record);
                    }
                }
            }
        }
        console.log(`Found ${records.length} result${records.length ? "s" : ""} : `);
        console.log("");
        let header: string = "";
        if (poss.length) {
            for (let i = 0; i < poss.length; i++) {
                header += table.header.members[poss[i]].index;
                if (i !== poss.length - 1) header += ", ";
            }
        } else {
            for (let i = 0; i < table.header.members.length; i++) {
                header += table.header.members[i].index;
                if (i !== table.header.members.length - 1) header += ", ";
            }
        }
        console.log(`-------------------------------------------`);
        console.log(header);
        console.log(`-------------------------------------------`);
        if (inst.names.length) {
            for (let rec of records) {
                let res: string = "";
                for (let i = 0; i < poss.length; i++) {
                    res += rec.value[poss[i]].toString();
                    if (i !== poss.length - 1) res += ", ";
                }
                console.log(res);
            }
        } else {
            for (let rec of records) {
                let res: string = "";
                for (let i = 0; i < rec.value.length; i++) {
                    res += rec.value[i].toString();
                    if (i !== rec.value.length - 1) res += ", ";
                }
                console.log(res);
            }
        }
        console.log(`-------------------------------------------`);
        console.log("");
        return `select success`;
    }

    dropIndex(inst: DropIndex, console: ILogger): string {
        let table: Table = null;
        for (let tab of this.tables) {
            if (tab.header.name === inst.tableName) {
                table = tab;
                break;
            }
        }
        if (!table) {
            throw `Runtime Error : when dropping index ${inst.indexName} on ${inst.tableName}, cannot find such table`;
        }
        let pos = -1;
        for (let i = 0; i < table.indices.length; i++) {
            if (table.indices[i].name === inst.indexName) {
                pos = i;
                break;
            }
        }
        if (pos === -1) {
            throw `Runtime Error : when dropping index ${inst.indexName} on ${inst.tableName}, cannot find such index`;
        }
        table.indices.splice(pos, 1);
        return `drop index ${inst.indexName} on table ${inst.tableName} success`;
    }

    dropTable(inst: DropTable, console: ILogger): string {
        let pos = -1;
        for (let i = 0; i < this.tables.length; i++) {
            if (this.tables[i].header.name === inst.tableName) {
                pos = i;
                break;
            }
        }
        if (pos === -1) {
            throw `Runtime Error : when dropping table ${inst.tableName}, cannot find such table`;
        }
        this.tables.splice(pos, 1);
        return `drop table ${inst.tableName} success`;
    }

    load(inst: Load, console: ILogger): string {
        // TODO
        return `load ${inst.filename} success`;
    }

    exit(inst: Exit, console: ILogger): string {
        this.writeTableFile();
        return `bye bye`;
    }

    show(inst: Show, console: ILogger): string {
        if (inst.flag === "tables") {
            console.log(`There are ${this.tables.length} table${this.tables.length > 1 ? "s" : ""}:`);
            for (let table of this.tables) {
                console.log(table.header.name);
            }
        } else {
            for (let table of this.tables) {
                if (table.indices.length) {
                    console.log(`indices of ${table.header.name}:`);
                    for (let index of table.indices) {
                        console.log(`${index.name} on ${index.index}`);
                    }
                }
            }
        }
        return `Show success`;
    }

    execute(inst: Execute): string {
        // the filename in `inst` is checked
        let counter = 0;
        let res = readFileSync(inst.filename)
            .toString()
            .split(";");
        res.pop();
        res.map(x => x + ";").filter(x => x !== ";")
            .map(x => parser(x))
            .map(x => {
                counter++;
                return x;
            })
            .map(x => this.deal(x, new FakeConsole()));
        return `execute file ${inst.filename} contains ${counter} instructions success`;
    }

    deal(inst: Instruction, console: ILogger): string {
        if (!inst) throw "illegal statement";
        switch (inst.itype) {
        case InstType.CREATE_TABLE:
            return this.createTable(inst as CreateTable, console);
        case InstType.CREATE_INDEX:
            return this.createIndex(inst as CreateIndex, console);
        case InstType.DROP_INDEX:
            return this.dropIndex(inst as DropIndex, console);
        case InstType.DROP_TABLE:
            return this.dropTable(inst as DropTable, console);
        case InstType.SELECT:
            return this.select(inst as Select, console);
        case InstType.DELETE:
            return this.delete(inst as Delete, console);
        case InstType.INSERT:
            return this.insert(inst as Insert, console);
        case InstType.EXIT:
            this.exit(inst as Exit, console);
            console.log(`bye bye`);
            process.exit(0);
        case InstType.SHOW:
            return this.show(inst as Show, console);
        case InstType.LOAD:
            return this.load(inst as Load, console);
        case InstType.EXECUTE_FILE:
            return this.execute(inst as Execute);
        default:
            throw "unrecognized/unimplemented instruction type";
        }
    }

}