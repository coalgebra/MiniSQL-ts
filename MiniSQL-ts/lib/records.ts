import {TableHeader} from "./tables";
import {ValueType} from "./ast";

export class Record {
    value: ValueType[];
    constructor(value: ValueType[]) {
        this.value = value;
    }
}