﻿import {Table, Index, parseTable } from "./tables";
import {CreateTable, CreateIndex, Insert, Delete, DropIndex, DropTable } from "./instruction";
import {writeFileSync, readFileSync} from "fs";

export class Catalog {

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
        this.tables.push(new Table(inst.toTableHeader(), []));

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
            if (x.index === inst.indexName) {
                throw `Runtime Error : when creating index ${inst.indexName} on table ${inst.tableName}, there already exists an index with the same name`;
            }
        }

        target.indices.push(new Index(inst.indexName, inst.elementName));

        return `create index ${inst.indexName} on table ${inst.tableName} success`;
    }

    writeTableFile() {
        writeFileSync("table.json", this.tables.map(x => x.toString()));
    }

    readTableFile() {
        this.tables = [];
        const temp = readFileSync("table.json");
        const content = temp.toString();
        const temp2 = JSON.parse(content);
        this.tables = temp2.tables.map(x => parseTable(x));
    }

    insert(inst: Insert): string {
        // TODO
        return `insert value success`;
    }

    delete(inst: Delete): string {
        // TODO
        return `delete value success`;
    }

    dropIndex(inst: DropIndex): string {
        // TODO
        return `drop index ${inst.indexName} on table ${inst.tableName} success`;
    }

    dropTable(inst: DropTable): string {
        // TODO
        return `drop table ${inst.tableName}`;
    }

}