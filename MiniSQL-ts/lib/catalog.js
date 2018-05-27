"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tables_1 = require("./tables");
const fs_1 = require("fs");
class Catalog {
    constructor() {
        this.tables = [];
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
        // create the table:
        this.tables.push(new tables_1.Table(inst.toTableHeader(), []));
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
            if (x.index === inst.tableName) {
                throw `Runtime Error : when creating index ${inst.indexName} on table ${inst.tableName}, there already exists an index with the same name`;
            }
        }
        target.indices.push(new tables_1.Index(inst.indexName, inst.elementName));
        return `create index ${inst.indexName} on table ${inst.tableName} success`;
    }
    writeTableFile() {
        fs_1.writeFileSync("table.json", this.tables.map(x => x.toString()));
    }
    readTableFile() {
        this.tables = [];
        const temp = fs_1.readFileSync("table.json");
        const content = temp.toString();
        const temp2 = JSON.parse(content);
        this.tables = temp2.tables.map(x => tables_1.parseTable(x));
    }
    insert(inst) {
        // TODO
        return `insert value success`;
    }
    delete(inst) {
        // TODO
        return `delete value success`;
    }
    dropIndex(inst) {
        // TODO
        return `drop index ${inst.indexName} on table ${inst.tableName} success`;
    }
    dropTable(inst) {
        // TODO
        return `drop table ${inst.tableName}`;
    }
}
exports.Catalog = Catalog;
//# sourceMappingURL=catalog.js.map