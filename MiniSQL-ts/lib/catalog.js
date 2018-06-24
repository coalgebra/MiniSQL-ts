"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tables_1 = require("./tables");
const instruction_1 = require("./instruction");
const fs_1 = require("fs");
const types_1 = require("./types");
const records_1 = require("./records");
const DATA_PATH = "data/";
const TABLE_METADATA_PATH = DATA_PATH + "table.json";
const INDEICES_PATH = DATA_PATH + "indices/";
const RECORD_PATH = DATA_PATH + "records/";
class Catalog {
    constructor() {
        //        this.tables = [];
        this.readTableFile();
    }
    createTable(inst) {
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
        this.tables.push(new tables_1.Table(inst.toTableHeader(), [], -1));
        this.tables[this.tables.length - 1].records = [];
        if (inst.primary)
            this.createIndex(new instruction_1.CreateIndex(inst.tableName + "_primary", inst.tableName, inst.primary));
        return `create table ${inst.tableName} success`;
    }
    createIndex(inst) {
        let target = null;
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
        let fieldType = null;
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
        let order = new Array();
        for (let i = 0; i < target.records.length; i++) {
            let x = target.records[i];
            if (typeof x !== "number") {
                order.push(i);
            }
        }
        let fun = null;
        switch (fieldType.btype) {
            case types_1.BasicType.INT:
            case types_1.BasicType.FLOAT:
                fun = (a, b) => {
                    return target.records[a].value[fieldIndex] >
                        target.records[b].value[fieldIndex];
                };
            case types_1.BasicType.CHARS:
                fun = (a, b) => {
                    return target.records[a].value[fieldIndex] >
                        target.records[b].value[fieldIndex];
                };
        }
        order.sort(fun);
        target.indices.push(new tables_1.Index(inst.indexName, inst.fieldName, order));
        return `create index ${inst.indexName} on table ${inst.tableName} success`;
    }
    writeTableFile() {
        fs_1.writeFileSync(TABLE_METADATA_PATH, JSON.stringify({ tables: this.tables.map(x => {
                return { header: x.header, indices: x.indices, freeHead: x.freeHead };
            })
        }, null, 2));
        this.tables.map(table => {
            fs_1.writeFileSync(RECORD_PATH + table.header.name + "_records.json", JSON.stringify({ records: table.records }, null, 2));
        });
    }
    readTableFile() {
        this.tables = [];
        let te = this;
        fs_1.access(TABLE_METADATA_PATH, (err) => {
            if (err) {
                return;
            }
            const temp = fs_1.readFileSync(TABLE_METADATA_PATH);
            const content = temp.toString();
            const temp2 = JSON.parse(content);
            for (let x of temp2.tables) {
                te.tables.push(x);
            }
            for (let x of te.tables) {
                let cont = fs_1.readFileSync(RECORD_PATH + x.header.name + "_records.json");
                let content = cont.toString();
                x.records = JSON.parse(content).records;
            }
        });
    }
    insert(inst) {
        let target = null;
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
                case types_1.BasicType.INT:
                    if (typeof val !== "number") {
                        throw `Insert Error : when inserting into ${inst.tableName}, type dismatch`;
                    }
                    else {
                        if (Math.floor(val) !== inst.values[i]) {
                            throw `Insert Error : when inserting into ${inst.tableName}, type dismatch`;
                        }
                    }
                    break;
                case types_1.BasicType.FLOAT:
                    if (typeof val !== "number") {
                        throw `Insert Error : when inserting into ${inst.tableName}, type dismatch`;
                    }
                    break;
                case types_1.BasicType.CHARS:
                    if (typeof val !== "string") {
                        throw `Insert Error : when inserting into ${inst.tableName}, type dismatch`;
                    }
            }
        }
        let pos;
        // insert record into records
        if (target.freeHead !== -1) {
            let cur = target.freeHead;
            //            target.freeHead = target.records[cur] as number;
            //            target.records[cur] = new Record(inst.values);
            pos = cur;
        }
        else {
            pos = target.records.length;
            //            target.records.push(new Record(inst.values));
        }
        let size = target.records.length;
        let pos_s = [];
        // insert records into indices
        for (let index of target.indices) {
            let field = -1;
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
            if (inst.values[field] < target.records[index.order[0]].value[field]) {
                //                index.order.unshift(pos);
                pos_s.push(0);
                continue;
            }
            if (inst.values[field] > target.records[index.order[size - 1]].value[field]) {
                //                index.order.push(pos);
                pos_s.push(size);
                continue;
            }
            let l = 0, r = index.order.length - 1;
            let cmp = (l, val) => {
                return target.records[index.order[l]].value[field] < val;
            };
            while (l < r - 1) {
                let mid = (l + r) >> 1;
                if (cmp(mid, inst.values[field])) {
                    l = mid;
                }
                else {
                    r = mid;
                }
            }
            if (target.records[index.order[l]].value[field] === inst.values[field]) {
                throw `not unique value on property ${index.index}`;
            }
            pos_s.push(l);
            //            index.order.splice(l, 0, pos);
        }
        if (target.freeHead !== -1) {
            let cur = target.freeHead;
            target.freeHead = target.records[cur];
            target.records[cur] = new records_1.Record(inst.values);
        }
        else {
            target.records.push(new records_1.Record(inst.values));
        }
        let i = 0;
        for (let index of target.indices) {
            index.order.splice(pos_s[i], 0, pos);
            i++;
        }
        return `insert value success`;
    }
    delete(inst) {
        return `delete value success`;
    }
    dropIndex(inst) {
        let table = null;
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
    dropTable(inst) {
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
    load(inst) {
        // TODO
        return `load ${inst.filename} success`;
    }
    exit(inst) {
        this.writeTableFile();
        return `bye bye`;
    }
}
exports.Catalog = Catalog;
//# sourceMappingURL=catalog.js.map