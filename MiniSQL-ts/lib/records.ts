import {TableHeader} from "./tables";
import {ValueType} from "./ast";

export class Record {
    table: TableHeader;
    value: ValueType[];

    constructor(table: TableHeader, value: ValueType[]) {
        this.table = table;
        this.value = value;
    }
}