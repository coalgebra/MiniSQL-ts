export enum BasicType {
    INT,
    FLOAT,
    CHARS
}

export interface IType {
    btype: BasicType;
    getSize(): number;
    toString(): string;
}

export function parseType(type:string) {
    switch (type[0]) {
        case "i":
            return new IntType();
        case "f":
            return new FloatType();
        case "c":
            return new CharsType(parseInt(type.substr(5, type.length - 6)));
        default:
            return null;
    }
}

export class IntType implements IType{
    btype = BasicType.INT;
    getSize() {
        return 4;
    }
    toString() {
        return "int";
    }
}

export class FloatType implements IType {
    btype = BasicType.FLOAT;
    getSize() {
        return 8;
    }
    toString() {
        return "float";
    }
}

export class CharsType implements IType {
    btype = BasicType.CHARS;
    count: number;

    getSize() {
        return this.count;
    }

    constructor(count: number) {
        this.btype = BasicType.CHARS;
        this.count = count;
    }
    toString() {
        return `char(${this.count})`;
    }
}