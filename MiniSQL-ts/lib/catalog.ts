import {Table, Index,  parseTableHeader, TableHeader } from "./tables";
import {CreateTable, CreateIndex, Insert, Delete, DropIndex, DropTable, Exit, Load } from "./instruction";
import {writeFileSync, readFileSync, writeFile, readFile, access, accessSync} from "fs";
import { IType, BasicType } from "./types";
import { Record } from "./records";

const DATA_PATH = "data/";
const TABLE_METADATA_PATH = DATA_PATH + "table.json";
const INDEICES_PATH = DATA_PATH + "indices/";
const RECORD_PATH = DATA_PATH + "records/";

export class Catalog {

    tables: Table[];

    constructor() {
//        this.tables = [];
        this.readTableFile();
    }

    createTable(inst: CreateTable): string {

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
            this.createIndex(new CreateIndex(inst.tableName + "_primary", inst.tableName, inst.primary));

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

    writeTableFile() {
        writeFileSync(TABLE_METADATA_PATH, JSON.stringify({ tables: this.tables.map(x => {
            return { header: x.header, indices: x.indices, freeHead : x.freeHead};
        })
        }, null, 2));

        this.tables.map(table => {
            writeFileSync(RECORD_PATH + table.header.name + "_records.json",
                JSON.stringify({ records : table.records }, null, 2));
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

    insert(inst: Insert): string {

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
//            target.freeHead = target.records[cur] as number;
//            target.records[cur] = new Record(inst.values);
            pos = cur;
        } else {
            pos = target.records.length;
//            target.records.push(new Record(inst.values));
        }

        let size = target.records.length;
        let pos_s: number[] = [];
        // insert records into indices
        for (let index of target.indices) {
            let field: number = -1;
            for (let i = 0; i < target.header.members.length; i++) {
                if (index.index === target.header.members[i].index) {
                    field = i;
                    break;
                }
            }
            if (!size) {
//                index.order.push(pos);
                pos_s.push(size);
                continue;
            }
            if (inst.values[field] < (target.records[index.order[0]] as Record).value[field]) {
//                index.order.unshift(pos);
                pos_s.push(0);
                continue;
            }
            if (inst.values[field] > (target.records[index.order[size - 1]] as Record).value[field]) {
//                index.order.push(pos);
                pos_s.push(size);
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
            pos_s.push(l);
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
            index.order.splice(pos_s[i], 0, pos);
            i++;
        }
        return `insert value success`;
    }

    delete(inst: Delete): string {
        return `delete value success`;
    }

    dropIndex(inst: DropIndex): string {
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

    dropTable(inst: DropTable): string {
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
        return `drop table ${inst.tableName}`;
    }

    load(inst: Load): string {
        // TODO
        return `load ${inst.filename} success`;
    }

    exit(inst: Exit): string {
        this.writeTableFile();
        return `bye bye`;
    }



}